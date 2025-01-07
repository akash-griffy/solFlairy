import { DataTypes, Model } from 'sequelize';
import sequelize from './connection'; // Import the Sequelize instance

class SolanaTransaction extends Model {
  id!: number;
  wallet_address!: string;
  solana_txn_hash!: string;
  usd_amount!: number;
  fairy_swap_status!: 'PENDING' | 'COMPLETED' | 'FAILED';
  disbursal_status!: 'PENDING' | 'COMPLETED' | 'FAILED';
  created_at!: Date;
  updated_at!: Date;
}

// Initialize the model
SolanaTransaction.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    wallet_address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    solana_txn_hash: {
      type: DataTypes.STRING,
      allowNull: false,
      unique:true
    },
    usd_amount: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
    },
    fairy_swap_status: {
      type: DataTypes.ENUM('PENDING', 'SUCCESS', 'FAILED'),
      allowNull: false,
      defaultValue: 'PENDING',
    },
    disbursal_status: {
      type: DataTypes.ENUM('PENDING', 'SUCCESS', 'FAILED'),
      allowNull: false,
      defaultValue: 'PENDING',
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      onUpdate: DataTypes.NOW, 
    },
  },
  {
    sequelize, 
    modelName: 'SolanaTransaction',
    tableName: 'solana_transactions',
    timestamps: true, 
    underscored: true, 
  }
);

export default SolanaTransaction;
