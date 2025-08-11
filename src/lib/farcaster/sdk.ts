'use client';

import { sdk } from '@farcaster/frame-sdk';

// Initialize the SDK - use the default export from frame-sdk
export const initializeFarcasterSDK = () => {
  return sdk;
};

// Utility function to check if SDK is ready
export const isFarcasterSDKReady = (farcasterSDK: typeof sdk): boolean => {
  return farcasterSDK.context !== null && farcasterSDK.context !== undefined;
};

// Get user's Farcaster profile from SDK context
export const getFarcasterProfile = (farcasterSDK: typeof sdk) => {
  if (!isFarcasterSDKReady(farcasterSDK)) return null;
  
  return farcasterSDK.context?.user || null;
};

// Utility to share content to Farcaster
export const shareToFarcaster = async (farcasterSDK: typeof sdk, content: {
  text: string;
  embeds?: string[];
}) => {
  if (!isFarcasterSDKReady(farcasterSDK)) {
    console.warn('Farcaster SDK not ready for sharing');
    return;
  }
  
  try {
    // Use SDK's compose cast action
    await farcasterSDK.actions.composeCast({
      text: content.text,
      embeds: content.embeds || []
    });
  } catch (error) {
    console.error('Failed to share to Farcaster:', error);
  }
};

export { sdk as farcasterSDK };