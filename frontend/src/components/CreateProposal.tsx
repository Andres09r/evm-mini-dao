import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MINIDAO_CONTRACT_ADDRESS, MINIDAO_ABI } from '@/lib/wagmi';
import toast from 'react-hot-toast';

export function CreateProposal({ onProposalCreated }: { onProposalCreated: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  const { writeContractAsync, data: hash, isPending } = useWriteContract();
  
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim()) {
      toast.error('Please fill in both title and description');
      return;
    }

    try {
      await writeContractAsync({
        address: MINIDAO_CONTRACT_ADDRESS,
        abi: MINIDAO_ABI,
        functionName: 'createProposal',
        args: [title, description],
      });
      
      toast.success('Proposal created successfully!');
      setTitle('');
      setDescription('');
      onProposalCreated();
    } catch (error: any) {
      console.error('Error creating proposal:', error);
      toast.error(error.shortMessage || error.message || 'Failed to create proposal');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Proposal</CardTitle>
        <CardDescription>
          Submit a new proposal for the DAO to vote on
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Title
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter proposal title"
              disabled={isPending || isConfirming}
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Description
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter proposal description"
              rows={4}
              disabled={isPending || isConfirming}
            />
          </div>
          
          <Button 
            type="submit" 
            disabled={isPending || isConfirming || !title.trim() || !description.trim()}
            className="w-full"
          >
            {isPending || isConfirming ? 'Creating...' : 'Create Proposal'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

