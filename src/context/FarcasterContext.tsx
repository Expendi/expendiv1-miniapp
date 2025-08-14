'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { initializeFarcasterSDK, isFarcasterSDKReady } from '@/lib/farcaster/sdk';
import { sdk } from '@farcaster/miniapp-sdk';

interface FarcasterContextType {
  sdk: typeof sdk | null;
  isReady: boolean;
  context: unknown;
  error: string | null;
  actions: {
    ready: () => Promise<void>;
    openUrl: (url: string) => Promise<void>;
    close: () => Promise<void>;
    composeCast: (options: { text: string; embeds?: string[] }) => Promise<void>;
  };
}

const FarcasterContext = createContext<FarcasterContextType | null>(null);

export const useFarcaster = () => {
  const context = useContext(FarcasterContext);
  if (!context) {
    throw new Error('useFarcaster must be used within FarcasterProvider');
  }
  return context;
};

interface FarcasterProviderProps {
  children: ReactNode;
}

export const FarcasterProvider = ({ children }: FarcasterProviderProps) => {
  const [sdkInstance, setSdkInstance] = useState<typeof sdk | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [context, setContext] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initSDK = async () => {
      try {
        const farcasterSDK = await initializeFarcasterSDK();
        setSdkInstance(farcasterSDK);

        // Wait for SDK to be ready
        const checkReady = async () => {
          const ready = await isFarcasterSDKReady(farcasterSDK);
          if (ready) {
            setIsReady(true);
            const context = await farcasterSDK.context;
            setContext(context);
            setError(null);
          } else {
            // Keep checking until ready
            setTimeout(checkReady, 100);
          }
        };

        checkReady();
      } catch (err) {
        console.error('Failed to initialize Farcaster SDK:', err);
        setError(err instanceof Error ? err.message : 'SDK initialization failed');
      }
    };

    initSDK();
  }, []);

  const actions = {
    ready: async () => {
      if (sdkInstance?.actions?.ready) {
        try {
          await sdkInstance.actions.ready();
        } catch (err) {
          console.error('Failed to call SDK ready:', err);
        }
      }
    },

    openUrl: async (url: string) => {
      if (sdkInstance?.actions?.openUrl) {
        try {
          await sdkInstance.actions.openUrl(url);
        } catch (err) {
          console.error('Failed to open URL:', err);
        }
      }
    },

    close: async () => {
      if (sdkInstance?.actions?.close) {
        try {
          await sdkInstance.actions.close();
        } catch (err) {
          console.error('Failed to close:', err);
        }
      }
    },

    composeCast: async (options: { text: string; embeds?: string[] }) => {
      if (sdkInstance?.actions?.composeCast) {
        try {
          await sdkInstance.actions.composeCast(options);
        } catch (err) {
          console.error('Failed to compose cast:', err);
        }
      }
    },
  };

  const value: FarcasterContextType = {
    sdk: sdkInstance,
    isReady,
    context,
    error,
    actions,
  };

  return (
    <FarcasterContext.Provider value={value}>
      {children}
    </FarcasterContext.Provider>
  );
};