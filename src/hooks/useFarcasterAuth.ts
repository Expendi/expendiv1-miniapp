'use client';

import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { initializeFarcasterSDK, isFarcasterSDKReady } from '@/lib/farcaster/sdk';
import { sdk } from '@farcaster/frame-sdk';

export const useFarcasterAuth = () => {
  const { ready, authenticated, user } = usePrivy();
  const [farcasterSDK, setFarcasterSDK] = useState<typeof sdk | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize Farcaster SDK
  useEffect(() => {
    try {
      const sdk = initializeFarcasterSDK();
      setFarcasterSDK(sdk);
    } catch (err) {
      console.error('Failed to initialize Farcaster SDK:', err);
      setError('Failed to initialize Farcaster SDK');
    }
  }, []);

  // Handle Farcaster SDK initialization
  useEffect(() => {
    if (!farcasterSDK || !ready) return;
    
    // Simple initialization without authentication flow
    // Authentication will be handled by Privy with Farcaster login method
    setIsLoading(false);
  }, [farcasterSDK, ready]);

  // Get Farcaster profile information
  const farcasterProfile = farcasterSDK && isFarcasterSDKReady(farcasterSDK) 
    ? farcasterSDK.context?.user 
    : null;

  return {
    // Authentication state
    ready,
    authenticated,
    user,
    isLoading,
    error,
    
    // Farcaster-specific data
    farcasterSDK,
    farcasterProfile,
    
    // Utility functions
    isFarcasterContext: !!farcasterSDK,
    isSDKReady: farcasterSDK ? isFarcasterSDKReady(farcasterSDK) : false,
  };
};