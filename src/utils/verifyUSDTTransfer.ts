import dotenv from 'dotenv';

dotenv.config();

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
    message?: string;
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
    if (!transferDetails.tokenTransfers || transferDetails.tokenTransfers.length === 0) {
      return { isValid: false, message: "No token transfer events found in the transaction details." };
    }
  
    const transferEvent = transferDetails.tokenTransfers[0];
  
    if (
      transferEvent.toUserAccount.toLowerCase() !==
      process.env.COMPANY_WALLET_ADDRESS?.toLowerCase()
    ) {
      return { isValid: false, message: "Recipient address does not match the company's wallet address." };
    }
  
    if (
      transferEvent.mint.toLowerCase() !==
      process.env.SOLANA_USDT_ADDRESS?.toLowerCase()
    ) {
      return { isValid: false, message: "Token mint address does not match the expected USDT address." };
    }
  
    const expectedDescription =
      `${transferEvent.fromUserAccount} transferred ` +
      `${transferEvent.tokenAmount} USDT to ` +
      `${transferEvent.toUserAccount}.`;
  
    if (expectedDescription !== transferDetails.description) {
      return { isValid: false, message: "Transaction description does not match the expected format." };
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
  