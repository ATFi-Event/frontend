// Contract ABIs and function selectors for ATFi project

export const FUNCTION_SELECTORS = {
  CREATE_EVENT: "0xc0e319c6",
} as const;

export const EVENT_TOPICS = {
  VAULT_CREATED: "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925", // This will need to be calculated from the actual event signature
} as const;

export const FACTORY_ATFI_ABI = [
  // Function to create events
  {
    inputs: [
      { internalType: "uint256", name: "stakeAmount", type: "uint256" },
      { internalType: "uint256", name: "registrationDeadline", type: "uint256" },
      { internalType: "uint256", name: "eventDate", type: "uint256" },
      { internalType: "uint256", name: "maxParticipant", type: "uint256" },
    ],
    name: "createEvent",
    outputs: [
      { internalType: "uint256", name: "eventId", type: "uint256" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  // Event emitted when vault is created
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "eventId", type: "uint256" },
      { indexed: true, internalType: "address", name: "vault", type: "address" },
      { indexed: true, internalType: "address", name: "organizer", type: "address" },
      { internalType: "uint256", name: "stakeAmount", type: "uint256" },
      { internalType: "uint256", name: "maxParticipant", type: "uint256" },
      { internalType: "uint256", name: "registrationDeadline", type: "uint256" },
      { internalType: "uint256", name: "eventDate", type: "uint256" },
    ],
    name: "VaultCreated",
    type: "event",
  },
] as const;

export const encodeCreateEventCalldata = (
  stakeAmount: string,
  registrationDeadline: number,
  eventDate: number,
  maxParticipant: number
) => {
  // Remove 0x prefix and concatenate parameters
  const selector = FUNCTION_SELECTORS.CREATE_EVENT.slice(2);

  // Pad each parameter to 32 bytes (64 hex characters)
  const stakeAmountHex = BigInt(stakeAmount).toString(16).padStart(64, "0");
  const registrationDeadlineHex = registrationDeadline.toString(16).padStart(64, "0");
  const eventDateHex = eventDate.toString(16).padStart(64, "0");
  const maxParticipantHex = maxParticipant.toString(16).padStart(64, "0");

  return `0x${selector}${stakeAmountHex}${registrationDeadlineHex}${eventDateHex}${maxParticipantHex}`;
};