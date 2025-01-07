import { WalletUnlocked, bn } from "fuels";
import { insertTransactionData } from "../db/insertTransactionData";
import { updateDisbursalStatus } from "../db/updateDisbursalStatus";
import { updateFairySwapStatus } from "../db/updateFairySwapStatus";
import { getAvailablePools } from "../utils/getPools";
import { getProvider } from "../utils/getProvider";
import { getSolanaAddressPredicateAddress } from "../utils/getSolanaAddressPredicate";
import type { Request,Response } from "express";
import * as mira from "mira-dex-ts"; // Assuming mira SDK is used

export const swapFairyHandler = async (req: Request, res: Response) => {
    try {
        console.log(req.body)
      // Step 1: Set Solana Account Address and USDT Amount
      //following is mock data:
      const solanaAccountAddress = "F7Ec1vwWm5yNVUbEMt5RF2W6JjriogME8MBG8Ckdiobr";
      const usdtAmount = 500000;
      const dummyTxnHash = "txnHash";
  
      const usdt = {
        bits: "0xa0265fb5c32f6e8db3197af3c7eb05c48ae373605b8165b6f4a51c5b0ba4812e",
      };
  
      const fairy = {
        bits: "0xc1fdba80b28f51004ede0290e904a59a7dc69d2453706c169630118a80ccde94",
      };
  
      const transactionData = {
        wallet_address: solanaAccountAddress,
        solana_txn_hash: dummyTxnHash,
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
        usdt.bits,
        fairy.bits,
        usdtAmount
      );
      const [_buyAsset, simulatedBuyAmount] =
        await readonlyMiraAmm.previewSwapExactInput(usdt, usdtAmount, [
          ...availablePools,
        ]);
  
      const buyAmountWithSlippage = simulatedBuyAmount
        .mul(bn(10_000).sub(bn(100)))
        .div(bn(10_000));
  
      const tx = await miraAmm.swapExactInput(
        usdtAmount,
        usdt,
        buyAmountWithSlippage,
        availablePools,
        4294967295,
        { gasLimit: 2000000, maxFee: 100000 }
      );
  
      const txn = await wallet.sendTransaction(tx);
      const txnId = (await txn.waitForResult()).id;
  
      const { success } = await updateFairySwapStatus(dummyTxnHash, "SUCCESS");
      if (!success) {
        return res.status(500).json({ message: "Internal server error" });
      }
  
      //step 4 : transfer fairy to users predicate account
  
      const fairyTransferTxn = await wallet.createTransfer(
        userPredicateAddress,
        buyAmountWithSlippage,
        fairy.bits
      );
  
      const txn2 = await wallet.sendTransaction(fairyTransferTxn);
      const txnId2 = (await txn2.waitForResult()).id;
  
      const disbursalResult = await updateDisbursalStatus(
        dummyTxnHash,
        "SUCCESS"
      );
      if (!disbursalResult.success) {
        return res.status(500).json({ message: "Internal server error" });
      }
  
      return res.json({ txnId: txnId2 });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };