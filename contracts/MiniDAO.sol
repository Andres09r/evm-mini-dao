// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract MiniDAO {
    struct Proposal {
        uint256 id;
        string title;
        string description;
        uint256 createdAtBlock;
        uint256 yesVotes;
        uint256 noVotes;
        bool finalized;
        bool passed;
        address proposer;
    }

    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(uint256 => mapping(address => bool)) public votes; // true = yes, false = no
    
    uint256 public proposalCount;
    uint256 public constant VOTING_PERIOD = 20; // blocks
    uint256 public constant MIN_BALANCE = 0.1 ether;

    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        string title,
        string description,
        uint256 createdAtBlock
    );

    event VoteSubmitted(
        uint256 indexed proposalId,
        address indexed voter,
        bool vote,
        uint256 yesVotes,
        uint256 noVotes
    );

    event ProposalFinalized(
        uint256 indexed proposalId,
        bool passed,
        uint256 yesVotes,
        uint256 noVotes
    );

    modifier onlyEligibleVoter() {
        require(address(msg.sender).balance >= MIN_BALANCE, "Insufficient ETH balance to vote");
        _;
    }

    modifier proposalExists(uint256 _proposalId) {
        require(_proposalId > 0 && _proposalId <= proposalCount, "Proposal does not exist");
        _;
    }

    modifier notFinalized(uint256 _proposalId) {
        require(!proposals[_proposalId].finalized, "Proposal already finalized");
        _;
    }

    modifier canFinalize(uint256 _proposalId) {
        require(
            block.number >= proposals[_proposalId].createdAtBlock + VOTING_PERIOD,
            "Voting period not yet ended"
        );
        _;
    }

    function createProposal(
        string memory _title,
        string memory _description
    ) external returns (uint256) {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");

        proposalCount++;
        
        proposals[proposalCount] = Proposal({
            id: proposalCount,
            title: _title,
            description: _description,
            createdAtBlock: block.number,
            yesVotes: 0,
            noVotes: 0,
            finalized: false,
            passed: false,
            proposer: msg.sender
        });

        emit ProposalCreated(
            proposalCount,
            msg.sender,
            _title,
            _description,
            block.number
        );

        return proposalCount;
    }

    function vote(uint256 _proposalId, bool _vote) 
        external 
        onlyEligibleVoter 
        proposalExists(_proposalId) 
        notFinalized(_proposalId) 
    {
        require(!hasVoted[_proposalId][msg.sender], "Already voted on this proposal");

        hasVoted[_proposalId][msg.sender] = true;
        votes[_proposalId][msg.sender] = _vote;

        if (_vote) {
            proposals[_proposalId].yesVotes++;
        } else {
            proposals[_proposalId].noVotes++;
        }

        emit VoteSubmitted(
            _proposalId,
            msg.sender,
            _vote,
            proposals[_proposalId].yesVotes,
            proposals[_proposalId].noVotes
        );
    }

    function finalizeProposal(uint256 _proposalId) 
        external 
        proposalExists(_proposalId) 
        notFinalized(_proposalId) 
        canFinalize(_proposalId) 
    {
        Proposal storage proposal = proposals[_proposalId];
        proposal.finalized = true;
        proposal.passed = proposal.yesVotes > proposal.noVotes;

        emit ProposalFinalized(
            _proposalId,
            proposal.passed,
            proposal.yesVotes,
            proposal.noVotes
        );
    }

    function getProposal(uint256 _proposalId) 
        external 
        view 
        proposalExists(_proposalId) 
        returns (
            uint256 id,
            string memory title,
            string memory description,
            uint256 createdAtBlock,
            uint256 yesVotes,
            uint256 noVotes,
            bool finalized,
            bool passed,
            address proposer
        ) 
    {
        Proposal memory proposal = proposals[_proposalId];
        return (
            proposal.id,
            proposal.title,
            proposal.description,
            proposal.createdAtBlock,
            proposal.yesVotes,
            proposal.noVotes,
            proposal.finalized,
            proposal.passed,
            proposal.proposer
        );
    }

    function getVoteCounts(uint256 _proposalId) 
        external 
        view 
        proposalExists(_proposalId) 
        returns (uint256 yesVotes, uint256 noVotes, uint256 totalVotes) 
    {
        Proposal memory proposal = proposals[_proposalId];
        return (
            proposal.yesVotes,
            proposal.noVotes,
            proposal.yesVotes + proposal.noVotes
        );
    }

    function canVote(address _voter) external view returns (bool) {
        return _voter.balance >= MIN_BALANCE;
    }

    function hasUserVoted(uint256 _proposalId, address _voter) 
        external 
        view 
        proposalExists(_proposalId) 
        returns (bool) 
    {
        return hasVoted[_proposalId][_voter];
    }

    function getUserVote(uint256 _proposalId, address _voter) 
        external 
        view 
        proposalExists(_proposalId) 
        returns (bool) 
    {
        require(hasVoted[_proposalId][_voter], "User has not voted on this proposal");
        return votes[_proposalId][_voter];
    }

    function canFinalizeProposal(uint256 _proposalId) 
        external 
        view 
        proposalExists(_proposalId) 
        returns (bool) 
    {
        return !proposals[_proposalId].finalized && 
               block.number >= proposals[_proposalId].createdAtBlock + VOTING_PERIOD;
    }

    function getRemainingBlocks(uint256 _proposalId) 
        external 
        view 
        proposalExists(_proposalId) 
        returns (uint256) 
    {
        uint256 endBlock = proposals[_proposalId].createdAtBlock + VOTING_PERIOD;
        if (block.number >= endBlock) {
            return 0;
        }
        return endBlock - block.number;
    }
}

