'use client';

import { sdk } from '@farcaster/miniapp-sdk';

// Initialize the SDK and call ready when ready
export const initializeFarcasterSDK = async () => {
  // Wait for SDK to be ready, then call ready
  await sdk.actions.ready();
  return sdk;
};

// Utility function to check if SDK is ready
export const isFarcasterSDKReady = async (farcasterSDK: typeof sdk): Promise<boolean> => {
  try {
    const context = await farcasterSDK.context;
    return context !== null && context !== undefined;
  } catch {
    return false;
  }
};

// Get user's Farcaster profile from SDK context
export const getFarcasterProfile = async (farcasterSDK: typeof sdk) => {
  const isReady = await isFarcasterSDKReady(farcasterSDK);
  if (!isReady) return null;
  
  try {
    const context = await farcasterSDK.context;
    return context?.user || null;
  } catch {
    return null;
  }
};

// Utility to share content to Farcaster
export const shareToFarcaster = async (farcasterSDK: typeof sdk, content: {
  text: string;
  embeds?: string[];
}) => {
  const isReady = await isFarcasterSDKReady(farcasterSDK);
  if (!isReady) {
    console.warn('Farcaster SDK not ready for sharing');
    return;
  }
  
  try {
    // Use SDK's compose cast action
    const embeds = content.embeds ? content.embeds.slice(0, 2) as [] | [string] | [string, string] : undefined;
    await farcasterSDK.actions.composeCast({
      text: content.text,
      embeds
    });
  } catch (error) {
    console.error('Failed to share to Farcaster:', error);
  }
};

export { sdk as farcasterSDK };