// Vault ABI for ATFi Event Vault Contract
export const VAULT_ABI = [
  {
    "inputs": [
      {"internalType": "uint256", "name": "_eventId", "type": "uint256"},
      {"internalType": "address", "name": "_organizer", "type": "address"},
      {"internalType": "uint256", "name": "_stakeAmount", "type": "uint256"},
      {"internalType": "uint256", "name": "_registrationDeadline", "type": "uint256"},
      {"internalType": "uint256", "name": "_eventDate", "type": "uint256"},
      {"internalType": "uint256", "name": "_maxParticipant", "type": "uint256"}
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "participant", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "DepositMade",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "participant", "type": "address"}
    ],
    "name": "AttendanceMarked",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": false, "internalType": "uint256", "name": "totalYield", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "protocolFee", "type": "uint256"}
    ],
    "name": "EventSettled",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "stakeAmount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "deposit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "_user", "type": "address"}
    ],
    "name": "getUserReward",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "claimReward",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "eventId",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "organizer",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "registrationDeadline",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "eventDate",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "maxParticipant",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getParticipantCount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "", "type": "address"}
    ],
    "name": "participants",
    "outputs": [
      {"internalType": "bool", "name": "hasDeposited", "type": "bool"},
      {"internalType": "bool", "name": "hasAttended", "type": "bool"},
      {"internalType": "bool", "name": "hasClaimed", "type": "bool"},
      {"internalType": "uint256", "name": "claimableRewards", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Function signatures for common vault operations
export const VAULT_FUNCTION_SIGNATURES = {
  DEPOSIT: '0xd0e30db0', // deposit()
  STAKE_AMOUNT: '0xb5f1f88c', // stakeAmount()
  USER_REWARD: '0x8da5cb5b', // getUserReward(address)
  CLAIM_REWARD: '0x4e71d92d', // claimReward()
  PARTICIPANT_INFO: '0x8b4c40b0', // participants(address)
} as const;

// USDC ABI for approval operations
export const USDC_ABI = [
  {
    "constant": false,
    "inputs": [
      {"name": "_spender", "type": "address"},
      {"name": "_value", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [{"name": "", "type": "bool"}],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {"name": "_from", "type": "address"},
      {"name": "_to", "type": "address"},
      {"name": "_value", "type": "uint256"}
    ],
    "name": "transferFrom",
    "outputs": [{"name": "", "type": "bool"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {"name": "_owner", "type": "address"},
      {"name": "_spender", "type": "address"}
    ],
    "name": "allowance",
    "outputs": [{"name": "", "type": "uint256"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {"name": "_owner", "type": "address"}
    ],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
    "type": "function"
  }
] as const;

// Function signatures for USDC operations
export const USDC_FUNCTION_SIGNATURES = {
  APPROVE: '0x095ea7b3', // approve(address,uint256)
  ALLOWANCE: '0xdd62ed3e', // allowance(address,address)
  BALANCE_OF: '0x70a08231', // balanceOf(address)
} as const;