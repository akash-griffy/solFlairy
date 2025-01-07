export interface TransferDetails {
  description: string;
  tokenTransfers: TokenTransfer[];
  signature: string;
  timestamp: number;
}

export interface TokenTransfer {
  fromTokenAccount: string;
  fromUserAccount: string;
  mint: string;
  toTokenAccount: string;
  toUserAccount: string;
  tokenAmount: number;
  tokenStandard: string;
}

export const verifyUSDTTransfer = (
  transferDetails: TransferDetails
): boolean => {
  const transferEvent = transferDetails.tokenTransfers[0];

  if (
    transferEvent.toUserAccount.toLowerCase() !==
    process.env.COMPANY_WALLET_ADDRESS?.toLowerCase()
  ) {
    return false;
  }

  if (
    transferEvent.mint.toLowerCase() !==
    process.env.SOLANA_USDT_ADDRESS?.toLowerCase()
  ) {
    return false;
  }

  const description =
    transferEvent.fromUserAccount +
    " transferred " +
    transferEvent.tokenAmount +
    " USDT to " +
    transferEvent.toUserAccount +
    ".";

  if (description !== transferDetails.description) {
    return false;
  }

  return true;
};
