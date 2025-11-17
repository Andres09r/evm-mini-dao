import { useState } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MINIDAO_CONTRACT_ADDRESS, MINIDAO_ABI } from "@/lib/wagmi";
import toast from "react-hot-toast";

interface Proposal {
  id: bigint;
  title: string;
  description: string;
  createdAtBlock: bigint;
  yesVotes: bigint;
  noVotes: bigint;
  finalized: boolean;
  passed: boolean;
  proposer: string;
}

interface ProposalCardProps {
  proposal: Proposal;
  onUpdate: () => void;
}

export function ProposalCard({ proposal, onUpdate }: ProposalCardProps) {
  const { address } = useAccount();
  const [isVoting, setIsVoting] = useState(false);

  const { writeContractAsync } = useWriteContract();

  // Check if user has voted
  const { data: hasVoted } = useReadContract({
    address: MINIDAO_CONTRACT_ADDRESS,
    abi: MINIDAO_ABI,
    functionName: "hasUserVoted",
    args: [proposal.id, address!],
    query: {
      enabled: !!address,
    },
  });

  // Check if user can vote
  const { data: canVote } = useReadContract({
    address: MINIDAO_CONTRACT_ADDRESS,
    abi: MINIDAO_ABI,
    functionName: "canVote",
    args: [address!],
    query: {
      enabled: !!address,
    },
  });

  // Check if proposal can be finalized
  const { data: canFinalize } = useReadContract({
    address: MINIDAO_CONTRACT_ADDRESS,
    abi: MINIDAO_ABI,
    functionName: "canFinalizeProposal",
    args: [proposal.id],
  });

  // Get remaining blocks
  const { data: remainingBlocks } = useReadContract({
    address: MINIDAO_CONTRACT_ADDRESS,
    abi: MINIDAO_ABI,
    functionName: "getRemainingBlocks",
    args: [proposal.id],
  });

  const handleVote = async (vote: boolean) => {
    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!canVote) {
      toast.error("You need at least 0.1 ETH to vote");
      return;
    }

    if (hasVoted) {
      toast.error("You have already voted on this proposal");
      return;
    }

    setIsVoting(true);
    try {
      await writeContractAsync({
        address: MINIDAO_CONTRACT_ADDRESS,
        abi: MINIDAO_ABI,
        functionName: "vote",
        args: [proposal.id, vote],
      });

      toast.success(`Vote ${vote ? "YES" : "NO"} submitted successfully!`);
      onUpdate();
    } catch (error: any) {
      console.error("Error voting:", error);
      toast.error(error.shortMessage || error.message || "Failed to vote");
    } finally {
      setIsVoting(false);
    }
  };

  const handleFinalize = async () => {
    if (!canFinalize) {
      toast.error("Proposal cannot be finalized yet");
      return;
    }

    try {
      await writeContractAsync({
        address: MINIDAO_CONTRACT_ADDRESS,
        abi: MINIDAO_ABI,
        functionName: "finalizeProposal",
        args: [proposal.id],
      });

      toast.success("Proposal finalized successfully!");
      onUpdate();
    } catch (error: any) {
      console.error("Error finalizing proposal:", error);
      toast.error(
        error.shortMessage || error.message || "Failed to finalize proposal"
      );
    }
  };

  const totalVotes = proposal.yesVotes + proposal.noVotes;
  const yesPercentage =
    totalVotes > 0n ? Number((proposal.yesVotes * 100n) / totalVotes) : 0;
  const noPercentage =
    totalVotes > 0n ? Number((proposal.noVotes * 100n) / totalVotes) : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{proposal.title}</CardTitle>
            <CardDescription>
              Proposal #{proposal.id.toString()}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {proposal.finalized ? (
              <Badge
                variant={proposal.passed ? "default" : "destructive"}
                className={proposal.passed ? "bg-blue-500" : ""}
              >
                {proposal.passed ? "PASSED" : "FAILED"}
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-green-500 text-white">
                ACTIVE
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">{proposal.description}</p>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>
              Yes Votes:{" "}
              <span className="text-green-500 font-bold text-xl">
                {proposal.yesVotes.toString()}
              </span>{" "}
              ({yesPercentage}%)
            </span>
            <span>
              No Votes:{" "}
              <span className="text-red-500 font-bold text-xl">
                {proposal.noVotes.toString()}
              </span>{" "}
              ({noPercentage}%)
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="flex h-2 rounded-full overflow-hidden">
              <div
                className="bg-green-500"
                style={{ width: `${yesPercentage}%` }}
              />
              <div
                className="bg-red-500"
                style={{ width: `${noPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {!proposal.finalized && remainingBlocks !== undefined && (
          <p className="text-sm text-gray-500">
            {remainingBlocks > 0n
              ? `${remainingBlocks.toString()} blocks remaining`
              : "Voting period ended - can be finalized"}
          </p>
        )}

        <p className="text-xs text-gray-400">
          Proposed by: {proposal.proposer.slice(0, 6)}...
          {proposal.proposer.slice(-4)}
        </p>
      </CardContent>

      {address && !proposal.finalized && (
        <CardFooter className="flex justify-between gap-2">
          {!hasVoted && canVote ? (
            <>
              <Button
                onClick={() => handleVote(true)}
                disabled={isVoting}
                className="flex-1"
                variant="default"
              >
                {isVoting ? "Voting..." : "Vote YES"}
              </Button>
              <Button
                onClick={() => handleVote(false)}
                disabled={isVoting}
                className="flex-1"
                variant="destructive"
              >
                {isVoting ? "Voting..." : "Vote NO"}
              </Button>
            </>
          ) : hasVoted ? (
            <p className="text-sm text-gray-500">You have already voted</p>
          ) : (
            <p className="text-sm text-gray-500">
              Need 0.1 ETH minimum to vote
            </p>
          )}

          {canFinalize && (
            <Button
              onClick={handleFinalize}
              variant="outline"
              className="border-green-500"
            >
              Finalize
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
