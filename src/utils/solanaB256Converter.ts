import { hexlify } from 'fuels';
import bs58 from 'bs58';

export function createB256Address(solanaAddress: string): string {
  try {
    return hexlify(bs58.decode(solanaAddress));
    
  } catch (error) {
    throw new Error(`Failed to create b256 address: ${error.message}`);
  }
}