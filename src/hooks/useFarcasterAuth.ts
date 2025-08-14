'use client';

import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { initializeFarcasterSDK, isFarcasterSDKReady } from '@/lib/farcaster/sdk';
import { sdk } from '@farcaster/miniapp-sdk';

export const useFarcasterAuth = () => {
  const { ready, authenticated, user } = usePrivy();
  const [farcasterSDK, setFarcasterSDK] = useState<typeof sdk | null>(null);
  const [farcasterProfile, setFarcasterProfile] = useState<{
    fid: number;
    username?: string;
    displayName?: string;
    pfpUrl?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize Farcaster SDK
  useEffect(() => {
    const initSDK = async () => {
      try {
        const sdk = await initializeFarcasterSDK();
        setFarcasterSDK(sdk);
      } catch (err) {
        console.error('Failed to initialize Farcaster SDK:', err);
        setError('Failed to initialize Farcaster SDK');
      }
    };
    
    initSDK();
  }, []);

  // Handle Farcaster SDK initialization and get profile
  useEffect(() => {
    if (!farcasterSDK || !ready) return;
    
    const loadProfile = async () => {
      try {
        const isReady = await isFarcasterSDKReady(farcasterSDK);
        if (isReady) {
          const context = await farcasterSDK.context;
          setFarcasterProfile(context?.user || null);
        }
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load Farcaster profile:', err);
        setIsLoading(false);
      }
    };
    
    loadProfile();
  }, [farcasterSDK, ready]);

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
    isSDKReady: !!farcasterProfile,
  };
};