'use client';

export const MiniAppAuth = () => {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full text-center">
        <div className="mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="/images/logo/logo.svg" 
            alt="Expendi Logo" 
            className="h-16 mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Welcome to Expendi
          </h1>
          <p className="text-gray-600 text-sm">
            Your Web3 Budget Wallet Manager
          </p>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
          <p className="text-purple-800 text-sm">
            🚀 Connecting with your Farcaster account...
          </p>
        </div>

        <div className="text-xs text-gray-500">
          <p>Powered by Farcaster + Privy</p>
        </div>
      </div>
    </div>
  );
};