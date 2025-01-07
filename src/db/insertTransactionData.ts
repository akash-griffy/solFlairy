
import SolanaTransaction from './models';

export const insertTransactionData = async (transactionData: any) => {
  try {
    const dbInsert = await SolanaTransaction.create(transactionData);

    return { success: true, message: 'Transaction inserted successfully', data: dbInsert };
  } catch (error: any) { 
    if (error.name === 'SequelizeValidationError') {
      return { success: false, message: 'Validation failed', details: error.message };
    }

    if (error.name === 'SequelizeUniqueConstraintError') {
      return { success: false, message: 'Duplicate transaction hash', details: error.message };
    }

    return { success: false, message: 'Internal server error', details: error.message };
  }
};
