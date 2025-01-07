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
  
  export interface ValidationResult {
    isValid: boolean;
    details?: {
      fromUser: string;
      tokenAmount: number;
      mint: string;
      signature: string;
      timestamp: number;
    };
  }
  
  export const verifyUSDTTransfer = (
    transferDetails: TransferDetails
  ): ValidationResult => {

    console.log(JSON.stringify(transferDetails))

    if (!transferDetails.tokenTransfers || transferDetails.tokenTransfers.length === 0) {
      return { isValid: false };
    }
  
    const transferEvent = transferDetails.tokenTransfers[0];
  
    if (
      transferEvent.toUserAccount.toLowerCase() !==
      process.env.COMPANY_WALLET_ADDRESS?.toLowerCase()
    ) {
      return { isValid: false };
    }
  
    if (
      transferEvent.mint.toLowerCase() !==
      process.env.SOLANA_USDT_ADDRESS?.toLowerCase()
    ) {
      return { isValid: false };
    }
  
    const expectedDescription =
      `${transferEvent.fromUserAccount} transferred ` +
      `${transferEvent.tokenAmount} USDT to ` +
      `${transferEvent.toUserAccount}.`;
  
    if (expectedDescription !== transferDetails.description) {
      return { isValid: false };
    }
  
    return {
      isValid: true,
      details: {
        fromUser: transferEvent.fromUserAccount,
        tokenAmount: transferEvent.tokenAmount,
        mint: transferEvent.mint,
        signature: transferDetails.signature,
        timestamp: transferDetails.timestamp,
      },
    };
  };
  