'use client';

import { useState } from 'react';

interface BudgetWallet {
  id: string;
  buckets?: Array<{
    id: string;
    name: string;
    balance: string;
  }>;
}

interface MiniAppQuickActionsProps {
  budgetWallet?: BudgetWallet;
  walletAddress?: string;
}

export const MiniAppQuickActions = ({ budgetWallet, walletAddress }: MiniAppQuickActionsProps) => {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  
  // Log to avoid unused variable warning
  console.log('Budget wallet:', budgetWallet, 'Wallet address:', walletAddress, 'Selected:', selectedAction);

  const quickActions = [
    {
      id: 'quick-spend',
      title: 'Quick Spend',
      description: 'Log an expense quickly',
      icon: '💸',
      color: 'from-red-400 to-pink-500',
    },
    {
      id: 'fund-bucket',
      title: 'Fund Bucket',
      description: 'Add money to a budget',
      icon: '💰',
      color: 'from-green-400 to-emerald-500',
    },
    {
      id: 'create-bucket',
      title: 'New Bucket',
      description: 'Create a budget category',
      icon: '🏷️',
      color: 'from-blue-400 to-cyan-500',
    },
    {
      id: 'view-full',
      title: 'Full App',
      description: 'Open complete dashboard',
      icon: '🚀',
      color: 'from-purple-400 to-indigo-500',
    },
  ];

  const handleActionClick = (actionId: string) => {
    setSelectedAction(actionId);
    
    // Handle different actions
    switch (actionId) {
      case 'view-full':
        window.open('/', '_blank');
        break;
      case 'quick-spend':
      case 'fund-bucket':
      case 'create-bucket':
        // These would open modals or navigate to specific flows
        alert(`${actionId} functionality coming soon!`);
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions Grid */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleActionClick(action.id)}
              className={`bg-gradient-to-r ${action.color} text-white p-4 rounded-lg text-left hover:shadow-lg transition-all duration-200 transform hover:scale-105`}
            >
              <div className="text-2xl mb-2">{action.icon}</div>
              <h4 className="font-semibold text-sm mb-1">{action.title}</h4>
              <p className="text-xs opacity-90">{action.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-800 mb-3">Today&apos;s Summary</h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">$0</p>
            <p className="text-xs text-gray-600">Income</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">$0</p>
            <p className="text-xs text-gray-600">Expenses</p>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-800">$0</p>
            <p className="text-xs text-gray-600">Net Balance Today</p>
          </div>
        </div>
      </div>

      {/* Quick Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2">💡 Pro Tip</h4>
        <p className="text-blue-700 text-sm">
          Create different budget buckets for various spending categories like &quot;Food&quot;, &quot;Entertainment&quot;, and &quot;Transport&quot; to better track your expenses.
        </p>
      </div>
    </div>
  );
};