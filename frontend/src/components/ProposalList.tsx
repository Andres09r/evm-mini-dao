import React from 'react';
import { useReadContract } from 'wagmi';
import { MINIDAO_CONTRACT_ADDRESS, MINIDAO_ABI } from '@/lib/wagmi';
import { ProposalCard } from './ProposalCard';

interface ProposalListProps {
  refreshTrigger: number;
  onUpdate: () => void;
}

export function ProposalList({ refreshTrigger, onUpdate }: ProposalListProps) {
  // Get total proposal count
  const { data: proposalCount, refetch } = useReadContract({
    address: MINIDAO_CONTRACT_ADDRESS,
    abi: MINIDAO_ABI,
    functionName: 'proposalCount',
    query: {
      refetchInterval: 5000, // Refetch every 5 seconds
    },
  });

  // Refetch when refreshTrigger changes
  React.useEffect(() => {
    refetch();
  }, [refreshTrigger, refetch]);

  if (!proposalCount || proposalCount === 0n) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No proposals yet. Create the first one!</p>
      </div>
    );
  }

  // Generate array of proposal IDs
  const proposalIds = Array.from({ length: Number(proposalCount) }, (_, i) => BigInt(i + 1));

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Proposals ({proposalCount.toString()})</h2>
      <div className="space-y-4">
        {proposalIds.reverse().map((id) => (
          <ProposalItem key={id.toString()} proposalId={id} onUpdate={onUpdate} />
        ))}
      </div>
    </div>
  );
}

function ProposalItem({ proposalId, onUpdate }: { proposalId: bigint; onUpdate: () => void }) {
  const { data: proposal, isLoading, error } = useReadContract({
    address: MINIDAO_CONTRACT_ADDRESS,
    abi: MINIDAO_ABI,
    functionName: 'getProposal',
    args: [proposalId],
    query: {
      refetchInterval: 5000,
    },
  });

  if (isLoading) {
    return (
      <div className="border rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="border rounded-lg p-6 text-center text-red-500">
        Error loading proposal #{proposalId.toString()}
      </div>
    );
  }

  const [id, title, description, createdAtBlock, yesVotes, noVotes, finalized, passed, proposer] = proposal;

  return (
    <ProposalCard
      proposal={{
        id,
        title,
        description,
        createdAtBlock,
        yesVotes,
        noVotes,
        finalized,
        passed,
        proposer,
      }}
      onUpdate={onUpdate}
    />
  );
}

