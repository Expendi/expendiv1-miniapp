import { PrivyClientConfig } from '@privy-io/react-auth';
import { base } from 'viem/chains';

export const farcasterPrivyConfig: PrivyClientConfig = {
  // Add Farcaster as a login method alongside existing email
  loginMethods: ['email', 'farcaster'],
  
  // Keep existing chain configuration
  supportedChains: [base],
  defaultChain: base,
  
  // Appearance customization for Farcaster context
  appearance: {
    theme: 'light',
    accentColor: '#8a63d2', // Farcaster purple
    logo: '/images/logo/logo.svg',
    showWalletLoginFirst: false,
    walletChainType: 'ethereum-only',
  },
  
  // Embedded wallet configuration - essential for Farcaster miniapps
  embeddedWallets: {
    createOnLogin: "all-users",
    noPromptOnSignature: false,
    showWalletUIs: true,
  },
  
  // MFA configuration
  mfa: {
    noPromptOnMfaRequired: false,
  },
  
  // Legal configuration
  legal: {
    termsAndConditionsUrl: 'https://yourdomain.com/terms',
    privacyPolicyUrl: 'https://yourdomain.com/privacy',
  },
};

export const isFarcasterMiniApp = (): boolean => {
  // Check if running in Farcaster miniapp context
  if (typeof window === 'undefined') return false;
  
  // Check for Farcaster miniapp context
  return window.location.pathname.includes('/miniapp') ||
         window.parent !== window || // Embedded context
         !!(window as unknown as { parent?: { location?: { hostname?: string } } }).parent?.location?.hostname?.includes('farcaster'); // Farcaster client
};