// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract BountyDapp {
    
    struct Bounty {
        address creator;
        uint256 amount;
        bool isClaimed;
        address winner;
    }

    mapping(uint256 => Bounty) public idToBounty;
    uint256 public bountyCount;
    mapping(uint256 => mapping(address => bool)) submissions;


    event BountyCreated(uint256 indexed id, address indexed creator, uint256 amount);
    event BountyClaimed(uint256 indexed id, address indexed claimer);
    event BountyAccepted(uint256 indexed id, address indexed winner);


    constructor() {
        bountyCount = 1;
    }

    function createBounty() external payable {
        require(msg.value > 0, "Bounty amount must be greater than 0");

        uint256 id = bountyCount;

        Bounty memory newBounty = Bounty({
            creator: payable(msg.sender),
            amount: msg.value,
            isClaimed: false,
            winner: address(0)
        });
        idToBounty [id] = newBounty;
        bountyCount++;

        emit BountyCreated(id, msg.sender, msg.value);
    }

    function submitSolution(uint256 _id) external {
        require(_id < bountyCount, "Invalid bounty ID");

        Bounty storage bounty = idToBounty[_id];
        require(!bounty.isClaimed, "Bounty has already been claimed");
        require(!submissions[_id][msg.sender], "You have already submitted a solution");

        submissions[_id][msg.sender] = true;
    }

    function acceptBounty(uint256 _id, address _winner) external {
        require(_id < bountyCount, "Invalid bounty ID");

        Bounty storage bounty = idToBounty[_id];
        require(bounty.creator == msg.sender, "Only bounty creator can accept a submission");
        require(bounty.winner != address(0), "Bounty already accepted"); 
        require(!submissions[_id][_winner], "The specified winner has not submitted a solution yet");       
       
        bounty.winner = payable(_winner);

        emit BountyAccepted(_id, _winner);
    }
    
    function claimBounty(uint256 _id) external {
        require(_id < bountyCount, "Invalid bounty ID");

        Bounty storage bounty = idToBounty[_id];
        require(!bounty.isClaimed, "Bounty has already been claimed");
        require(submissions[_id][msg.sender], "You have not submitted a solution");
        require(bounty.winner == msg.sender, "You are not the winner of this bounty");       

        bounty.isClaimed = true;
        payable(msg.sender).transfer(bounty.amount);

        emit BountyClaimed(_id, msg.sender);
    }
}
