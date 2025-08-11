'use client';

export const MiniAppLoading = () => {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          Loading Expendi
        </h2>
        <p className="text-gray-600 text-sm">
          Connecting to Farcaster...
        </p>
      </div>
    </div>
  );
};