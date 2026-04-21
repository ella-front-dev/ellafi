"use client";

import { useWalletData } from "@/hooks/use-wallet-data";
import { Navbar } from "@/components/dashboard/navbar";
import { WalletConnectPrompt } from "@/components/wallet/wallet-connect-prompt";
import { WalletAddressCard } from "@/components/wallet/wallet-address-card";
import { TokenBalanceList } from "@/components/wallet/token-balance-list";
import { SendForm } from "@/components/wallet/send-form";

export default function WalletPage() {
  const { isConnected, address } = useWalletData();

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <main className="max-w-screen-xl mx-auto px-4 py-6">
        <h1 className="text-lg font-semibold text-text mb-5">Wallet</h1>

        {!isConnected || !address ? (
          <WalletConnectPrompt />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left column */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <WalletAddressCard address={address} />
              <TokenBalanceList />
            </div>

            {/* Right column */}
            <div className="flex flex-col gap-4">
              <SendForm />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
