'use client';

import { shareToFarcaster, initializeFarcasterSDK } from '@/lib/farcaster/sdk';

interface FarcasterProfile {
  username?: string;
  pfp?: string;
  fid?: number;
}

interface MiniAppHeaderProps {
  farcasterProfile?: FarcasterProfile;
  walletAddress?: string;
}

export const MiniAppHeader = ({ farcasterProfile, walletAddress }: MiniAppHeaderProps) => {
  const handleShare = async () => {
    try {
      const sdk = initializeFarcasterSDK();
      await shareToFarcaster(sdk, {
        text: "🚀 Just checked my budget on @expendi! Managing my expenses with Web3 has never been easier. Try it out!",
        embeds: [window.location.origin + '/miniapp']
      });
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="/images/logo/logo.svg" 
            alt="Expendi" 
            className="h-8 w-8 bg-white rounded-full p-1"
          />
          <div>
            <h1 className="text-lg font-semibold">Expendi</h1>
            <p className="text-xs text-purple-100">Budget Wallet Manager</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {farcasterProfile && (
            <div className="flex items-center space-x-2">
              {farcasterProfile.pfp && (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={farcasterProfile.pfp} 
                    alt={farcasterProfile.username}
                    className="h-8 w-8 rounded-full border-2 border-white/20"
                  />
                </>
              )}
              <span className="text-sm font-medium">
                @{farcasterProfile.username}
              </span>
            </div>
          )}
          
          <button
            onClick={handleShare}
            className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors"
          >
            Share 📤
          </button>
        </div>
      </div>
      
      {walletAddress && (
        <div className="mt-3 bg-white/10 rounded-lg p-3">
          <p className="text-xs text-purple-100 mb-1">Wallet Address</p>
          <p className="text-sm font-mono">
            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </p>
        </div>
      )}
    </div>
  );
};