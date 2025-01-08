import { WalletUnlocked, bn } from "fuels";
import { insertTransactionData } from "../db/insertTransactionData";
import { updateDisbursalStatus } from "../db/updateDisbursalStatus";
import { updateFairySwapStatus } from "../db/updateFairySwapStatus";
import { getAvailablePools } from "../utils/getPools";
import { getProvider } from "../utils/getProvider";
import { getSolanaAddressPredicateAddress } from "../utils/getSolanaAddressPredicate";
import type { Request, Response } from "express";
import * as mira from "mira-dex-ts"; // Assuming mira SDK is used
import { verifyUSDTTransfer } from "../utils/verifyUSDTTransfer";
import { DECI_MULTIPLIER, FUEL_FAIRY, FUEL_USDT } from "../constants/constants";

export const swapFairyHandler = async (req: Request, res: Response) => {
  try {
    // Step 1: Set Solana Account Address and USDT Amount
    const validationResult = verifyUSDTTransfer(req.body[0]);
    if (!validationResult.isValid) {
      console.log(
        "Invalid solana transaction. message : ",
        validationResult.message
      );
      return res.status(400).json({ message: "Bad Request" });
    }

    if (!validationResult.details)
      return res.status(400).json({ message: "Bad Request" });
    const solanaAccountAddress = validationResult.details.fromUser;
    const usdtAmount = validationResult.details.tokenAmount * DECI_MULTIPLIER;
    const transactionSignature = validationResult.details.signature;

    const transactionData = {
      wallet_address: solanaAccountAddress,
      solana_txn_hash: transactionSignature,
      usd_amount: usdtAmount / 1000000,
      fairy_swap_status: "PENDING",
      disbursal_status: "PENDING",
    };

    const dbInsertResult = await insertTransactionData(transactionData);
    if (!dbInsertResult.success) {
      console.log(
        "Error while inserting into database. Err :",
        dbInsertResult.details
      );
      return res.status(409).json({ message: dbInsertResult.message });
    }

    // Step 2: Create connectors predicate address
    const userPredicateAddress = await getSolanaAddressPredicateAddress(
      solanaAccountAddress
    );

    // Step 3: Swap fairy from our account
    const provider = await getProvider();

    const readonlyMiraAmm = new mira.ReadonlyMiraAmm(provider);
    const wallet = new WalletUnlocked(
      process.env.WALLET_PRIVATE_KEY as string, // Accessing the environment variable
      provider
    );
    const miraAmm = new mira.MiraAmm(wallet);

    const availablePools = await getAvailablePools(
      FUEL_USDT.bits,
      FUEL_FAIRY.bits,
      usdtAmount
    );
    const [_buyAsset, simulatedBuyAmount] =
      await readonlyMiraAmm.previewSwapExactInput(FUEL_USDT, usdtAmount, [
        ...availablePools,
      ]);

    const buyAmountWithSlippage = simulatedBuyAmount
      .mul(bn(10_000).sub(bn(100)))
      .div(bn(10_000));

    const tx = await miraAmm.swapExactInput(
      usdtAmount,
      FUEL_USDT,
      buyAmountWithSlippage,
      availablePools,
      4294967295,
      { gasLimit: 2000000, maxFee: 100000 }
    );

    const txn = await wallet.sendTransaction(tx);
    const txnResult = await txn.waitForResult();

    if (txnResult.status) {
      const { success } = await updateFairySwapStatus(
        transactionSignature,
        txnResult.status
      );
      if (!success) {
        return res.status(500).json({ message: "Internal server error" });
      }
    }

    //step 4 : transfer fairy to users predicate account

    const fairyWithGasDeducted = (buyAmountWithSlippage.toNumber() - ((buyAmountWithSlippage.toNumber()/usdtAmount) * 100000))

    const fairyTransferTxn = await wallet.createTransfer(
      userPredicateAddress,
      fairyWithGasDeducted,
      FUEL_FAIRY.bits
    );

    const txnWithEthTopup = wallet.addTransfer(fairyTransferTxn,{destination:userPredicateAddress,amount:9999,assetId:provider.getBaseAssetId()})

    const txn2 = await wallet.sendTransaction(txnWithEthTopup);
    const txn2Result = await txn2.waitForResult();

    if (txn2Result.status) {
      const disbursalResult = await updateDisbursalStatus(
        transactionSignature,
        txn2Result.status
      );
      if (!disbursalResult.success) {
        return res.status(500).json({ message: "Internal server error" });
      }
    }

    return res.json({ txn1: txnResult.id, txn2: txn2Result.id });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
