'use client';

// import { getAllTransactions } from '@/hooks/subgraph-queries/getAllTransactions';
import { useEffect, useState } from 'react';
import { formatEther } from 'viem';

interface Transaction {
  id: string;
  type: string;
  amount: string;
  timestamp: string;
  transactionHash?: string;
  bucket?: {
    name: string;
  };
}

interface MiniAppRecentTransactionsProps {
  walletAddress?: string;
}

export const MiniAppRecentTransactions = ({ walletAddress }: MiniAppRecentTransactionsProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!walletAddress) return;
      
      try {
        setIsLoading(true);
        // TODO: Implement actual transaction fetching
        // const result = await getAllTransactions(walletAddress);
        // setTransactions(result?.slice(0, 10) || []); // Show only recent 10
        
        // Mock data for now
        setTransactions([]);
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [walletAddress]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-100 animate-pulse rounded-lg p-4 h-16"></div>
        ))}
      </div>
    );
  }

  if (!transactions.length) {
    return (
      <div className="text-center py-12">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            No Transactions Yet
          </h3>
          <p className="text-gray-600 text-sm">
            Your transaction history will appear here once you start using your budget wallet.
          </p>
        </div>
      </div>
    );
  }

  const getTransactionIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'deposit':
      case 'fund':
        return '💰';
      case 'spend':
      case 'expense':
        return '💸';
      case 'transfer':
        return '🔄';
      default:
        return '📄';
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(parseInt(timestamp) * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Recent Transactions</h3>
      
      <div className="space-y-3">
        {transactions.map((tx, index) => (
          <div key={tx.id || index} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-xl">
                  {getTransactionIcon(tx.type)}
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 text-sm">
                    {tx.type || 'Transaction'}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {tx.timestamp ? formatDate(tx.timestamp) : 'Unknown date'}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <p className={`font-semibold text-sm ${
                  tx.type?.toLowerCase() === 'deposit' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {tx.type?.toLowerCase() === 'deposit' ? '+' : '-'}
                  {tx.amount ? parseFloat(formatEther(BigInt(tx.amount))).toFixed(4) : '0.0000'} ETH
                </p>
                {tx.bucket && (
                  <p className="text-xs text-gray-500">
                    {tx.bucket.name || 'Unknown Bucket'}
                  </p>
                )}
              </div>
            </div>
            
            {tx.transactionHash && (
              <div className="mt-2 pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-400 font-mono">
                  {tx.transactionHash.slice(0, 10)}...{tx.transactionHash.slice(-6)}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="text-center pt-4">
        <button 
          onClick={() => window.open('/transactions', '_blank')}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          View All Transactions →
        </button>
      </div>
    </div>
  );
};