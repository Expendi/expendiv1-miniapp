import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Expendi - Budget Wallet (Miniapp)",
  description: "Manage your budget wallets from Farcaster",
  openGraph: {
    title: "Expendi - Budget Wallet Manager",
    description: "Track expenses and manage budget wallets with Web3",
    images: ["/images/logo/logo.svg"],
  },
  twitter: {
    card: "summary",
    title: "Expendi - Budget Wallet Manager", 
    description: "Track expenses and manage budget wallets with Web3",
  },
};

export default function MiniAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="miniapp-container min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-md mx-auto">
        {children}
      </div>
    </div>
  );
}