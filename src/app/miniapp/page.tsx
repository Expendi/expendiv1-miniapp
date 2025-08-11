'use client';

import { useFarcasterAuth } from '@/hooks/useFarcasterAuth';
import { MiniAppDashboard } from '@/components/miniapp/MiniAppDashboard';
import { MiniAppLoading } from '@/components/miniapp/MiniAppLoading';
import { MiniAppAuth } from '@/components/miniapp/MiniAppAuth';

export default function MiniAppPage() {
  const { 
    ready, 
    authenticated, 
    isLoading, 
    error, 
    farcasterProfile 
  } = useFarcasterAuth();

  // Show loading state while initializing
  if (!ready || isLoading) {
    return <MiniAppLoading />;
  }

  // Show error state if authentication failed
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full text-center">
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            Authentication Error
          </h2>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show authentication prompt if not authenticated
  if (!authenticated) {
    return <MiniAppAuth />;
  }

  // Show main miniapp dashboard
  return (
    <MiniAppDashboard 
      farcasterProfile={farcasterProfile}
    />
  );
}