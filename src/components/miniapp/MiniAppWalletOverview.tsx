'use client';

import { formatEther } from 'viem';

interface BudgetWallet {
  id: string;
  buckets?: Array<{
    id: string;
    name: string;
    balance: string;
    spentAmount?: string;
  }>;
}

interface MiniAppWalletOverviewProps {
  budgetWallet?: BudgetWallet;
  walletAddress?: string;
}

export const MiniAppWalletOverview = ({ budgetWallet }: MiniAppWalletOverviewProps) => {
  if (!budgetWallet) {
    return (
      <div className="text-center py-12">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            No Budget Wallet Found
          </h3>
          <p className="text-blue-600 text-sm mb-4">
            Create your first budget wallet to start tracking expenses.
          </p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
            Create Wallet
          </button>
        </div>
      </div>
    );
  }

  const totalBalance = budgetWallet.buckets?.reduce((acc: number, bucket) => {
    return acc + parseFloat(formatEther(BigInt(bucket.balance || '0')));
  }, 0) || 0;

  const activeBuckets = budgetWallet.buckets?.filter((bucket) => 
    parseFloat(formatEther(BigInt(bucket.balance || '0'))) > 0
  ) || [];

  return (
    <div className="space-y-4">
      {/* Balance Overview */}
      <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white p-6 rounded-lg">
        <h2 className="text-sm font-medium opacity-90 mb-1">Total Balance</h2>
        <p className="text-3xl font-bold mb-2">
          {totalBalance.toFixed(4)} ETH
        </p>
        <p className="text-sm opacity-80">
          Across {activeBuckets.length} active bucket{activeBuckets.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Budget Buckets */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Budget Buckets</h3>
        
        {activeBuckets.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-gray-600 text-sm">No active buckets</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeBuckets.map((bucket, index: number) => {
              const balance = parseFloat(formatEther(BigInt(bucket.balance || '0')));
              const percentage = totalBalance > 0 ? (balance / totalBalance) * 100 : 0;
              
              return (
                <div key={bucket.id || index} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-gray-800">
                      {bucket.name || `Bucket ${index + 1}`}
                    </h4>
                    <span className="text-sm font-semibold text-blue-600">
                      {balance.toFixed(4)} ETH
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{percentage.toFixed(1)}% of total</span>
                    {bucket.spentAmount && (
                      <span>Spent: {parseFloat(formatEther(BigInt(bucket.spentAmount))).toFixed(4)} ETH</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};