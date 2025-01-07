import SolanaTransaction from "./models";

interface UpdateStatusResult {
  success: boolean;
}

export const updateDisbursalStatus = async (
  transactionHash: string,
  status: string
): Promise<UpdateStatusResult> => {
  try {
    const [affectedRows] = await SolanaTransaction.update(
      { disbursal_status: status },
      {
        where: { solana_txn_hash: transactionHash },
      }
    );

    if (affectedRows === 0) {
      console.log(`No record found with ID ${transactionHash}`);
      return { success: false };
    }

    console.log(`Transaction ID ${transactionHash} updated successfully`);
    return { success: true };
  } catch (error) {
    console.error("Error updating disbursal status:", error);
    return { success: false };
  }
};
