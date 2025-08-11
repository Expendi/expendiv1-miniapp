'use client';

import { useState } from 'react';
import { useWalletAddress } from '@/hooks/useWalletAddress';
import { useUserBudgetWallet } from '@/hooks/subgraph-queries/useUserBudgetWallet';
import { MiniAppHeader } from './MiniAppHeader';
import { MiniAppWalletOverview } from './MiniAppWalletOverview';
import { MiniAppQuickActions } from './MiniAppQuickActions';
import { MiniAppRecentTransactions } from './MiniAppRecentTransactions';

interface FarcasterProfile {
  username?: string;
  pfp?: string;
  fid?: number;
}

interface MiniAppDashboardProps {
  farcasterProfile?: FarcasterProfile;
}

export const MiniAppDashboard = ({ farcasterProfile }: MiniAppDashboardProps) => {
  const { walletAddress } = useWalletAddress();
  const { data: budgetWallet, isLoading } = useUserBudgetWallet(walletAddress);
  const [activeTab, setActiveTab] = useState<'overview' | 'actions' | 'history'>('overview');

  // Remove unused budgetWallet parameter warnings
  console.log('Budget wallet data:', budgetWallet, 'Loading:', isLoading);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <MiniAppHeader 
        farcasterProfile={farcasterProfile}
        walletAddress={walletAddress}
      />

      {/* Navigation Tabs */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="flex">
          {[
            { key: 'overview', label: '💰 Overview' },
            { key: 'actions', label: '⚡ Actions' },
            { key: 'history', label: '📊 History' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as 'overview' | 'actions' | 'history')}
              className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-purple-500 text-purple-600 bg-purple-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <MiniAppWalletOverview 
                budgetWallet={budgetWallet}
                walletAddress={walletAddress}
              />
            )}
            
            {activeTab === 'actions' && (
              <MiniAppQuickActions 
                budgetWallet={budgetWallet as BudgetWallet}
                walletAddress={walletAddress}
              />
            )}
            
            {activeTab === 'history' && (
              <MiniAppRecentTransactions 
                walletAddress={walletAddress}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};