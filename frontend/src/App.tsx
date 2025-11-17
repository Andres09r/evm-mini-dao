import { useState } from "react";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, ConnectButton } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { config } from "./lib/wagmi";
import { CreateProposal } from "./components/CreateProposal";
import { ProposalList } from "./components/ProposalList";

import "@rainbow-me/rainbowkit/styles.css";

const queryClient = new QueryClient();

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleProposalCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleUpdate = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <div className="min-h-screen bg-gray-50">
            <Toaster position="top-right" />

            <header className="bg-white shadow-sm border-b">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      K.A.T DAO
                    </h1>
                    <p className="text-sm text-gray-500">
                      Decentralized Autonomous Organization on Kaspa Chain
                    </p>
                  </div>
                  <ConnectButton />
                </div>
              </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                  <CreateProposal onProposalCreated={handleProposalCreated} />
                </div>

                <div className="lg:col-span-2">
                  <ProposalList
                    refreshTrigger={refreshTrigger}
                    onUpdate={handleUpdate}
                  />
                </div>
              </div>
            </main>
          </div>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
