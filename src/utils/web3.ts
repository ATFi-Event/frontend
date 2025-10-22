declare global {
  interface Window {
    ethereum?: any
  }
}

export interface Web3State {
  isConnected: boolean
  address: string | null
  chainId: number | null
  isConnecting: boolean
  error: string | null
}

export class Web3Service {
  private provider: any = null;
  private state: Web3State = {
    isConnected: false,
    address: null,
    chainId: null,
    isConnecting: false,
    error: null,
  }

  getState(): Web3State {
    return { ...this.state }
  }

  // Set the wallet provider (Privy embedded wallet or external provider)
  async setProvider(provider: any) {
    this.provider = provider;

    // If this is a Privy embedded wallet, extract the address and update state
    if (provider && provider.address) {
      this.state.address = provider.address;
      this.state.isConnected = true;
      this.state.error = null;

      // Also try to get chainId if available
      if (provider.chainId) {
        this.state.chainId = typeof provider.chainId === 'string'
          ? parseInt(provider.chainId, 16)
          : provider.chainId;
      }
    }
  }

  async connectWallet(): Promise<string> {
    // Use the set provider or fallback to window.ethereum for backward compatibility
    const provider = this.provider || window.ethereum;

    if (!provider) {
      throw new Error('No wallet provider available')
    }

    try {
      this.state.isConnecting = true
      this.state.error = null

      const accounts = await provider.request({
        method: 'eth_requestAccounts',
      })

      if (accounts.length === 0) {
        throw new Error('No accounts found')
      }

      const account = accounts[0]
      const chainId = await provider.request({
        method: 'eth_chainId',
      })

      this.state.isConnected = true
      this.state.address = account
      this.state.chainId = parseInt(chainId, 16)
      this.state.isConnecting = false

      return account
    } catch (error) {
      this.state.isConnecting = false
      this.state.error = error instanceof Error ? error.message : 'Failed to connect wallet'
      throw error
    }
  }

  async disconnectWallet(): Promise<void> {
    this.state.isConnected = false
    this.state.address = null
    this.state.chainId = null
    this.state.error = null
  }

  async switchChain(chainId: number): Promise<void> {
    const provider = this.provider || window.ethereum;

    if (!provider) {
      throw new Error('No wallet provider available')
    }

    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      })
    } catch (error: any) {
      // This error code indicates that the chain has not been added to the wallet
      if (error.code === 4902) {
        // You could add chain configuration here if needed
        throw new Error('Chain not found in wallet')
      }
      throw error
    }
  }

  async sendTransaction(to: string, data: string, value: string = '0x0'): Promise<string> {
    const provider = this.provider || window.ethereum;

    if (!provider || !this.state.address) {
      throw new Error('Wallet not connected')
    }

    try {
      const transactionParams = {
        from: this.state.address,
        to,
        data,
        value,
      }

      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [transactionParams],
      })

      return txHash
    } catch (error) {
      throw new Error(`Transaction failed: ${error}`)
    }
  }

  async callContract(contractAddress: string, data: string): Promise<string> {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed')
    }

    try {
      const result = await window.ethereum.request({
        method: 'eth_call',
        params: [
          {
            to: contractAddress,
            data,
          },
          'latest',
        ],
      })

      return result
    } catch (error) {
      throw new Error(`Contract call failed: ${error}`)
    }
  }

  async getUSDCBalance(address: string): Promise<string> {
    // Use the embedded provider or fallback to window.ethereum
    const provider = this.provider || window.ethereum;

    if (!provider) {
      console.warn('No wallet provider available, returning 0 balance')
      return '0'
    }

    try {
      // USDC contract address on Base Sepolia
      const usdcAddress = '0x036CbD542CE6Cc06855bCFD8DB6cfE6A748673F7'

      // ERC20 balanceOf function signature: balanceOf(address)
      const functionSignature = '0x70a08231'

      // Pad the address to 32 bytes and remove the 0x prefix
      const paddedAddress = address.slice(2).padStart(64, '0')

      // Create the calldata
      const data = functionSignature + paddedAddress

      // Make the call
      const result = await provider.request({
        method: 'eth_call',
        params: [
          {
            to: usdcAddress,
            data,
          },
          'latest',
        ],
      })

      // Convert the result from hex to decimal (USDC has 6 decimals)
      const balanceHex = result
      const balanceWei = parseInt(balanceHex, 16)
      const balanceUSDC = balanceWei / 1000000 // Convert from smallest unit to USDC

      return balanceUSDC.toString()
    } catch (error) {
      console.error('Error getting USDC balance:', error)
      return '0'
    }
  }

  // Legacy method for backward compatibility - gets ETH balance
  async getBalance(address: string): Promise<string> {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed')
    }

    try {
      const result = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      })

      // Convert from wei to ETH
      const balanceWei = parseInt(result, 16)
      const balanceETH = balanceWei / Math.pow(10, 18)

      return balanceETH.toString()
    } catch (error) {
      console.error('Error getting ETH balance:', error)
      return '0'
    }
  }

  async registerForEvent(vaultAddress: string, stakeAmount: string): Promise<string> {
    if (!window.ethereum || !this.state.address) {
      throw new Error('Wallet not connected')
    }

    try {
      // Convert stake amount from USDC (6 decimals) to wei for contract
      const stakeAmountWei = (parseFloat(stakeAmount) * 1000000).toString(16)
      const valueHex = `0x${stakeAmountWei.padStart(64, '0')}`

      // Simple register function signature (example implementation)
      // This would need to match your actual smart contract ABI
      const functionSignature = '0x' // Replace with actual function signature
      const data = functionSignature + valueHex

      const txHash = await this.sendTransaction(vaultAddress, data)
      return txHash
    } catch (error) {
      console.error('Error registering for event:', error)
      throw new Error(`Event registration failed: ${error}`)
    }
  }

  async depositToEvent(vaultAddress: string, amount: string): Promise<string> {
    if (!window.ethereum || !this.state.address) {
      throw new Error('Wallet not connected')
    }

    try {
      // Convert amount from USDC (6 decimals) to wei for contract
      const amountWei = (parseFloat(amount) * 1000000).toString(16)

      // First approve USDC spending (if needed)
      const usdcAddress = '0x036CbD542CE6Cc06855bCFD8DB6cfE6A748673F7'
      const approveAmount = `0x${amountWei.padStart(64, '0')}`
      const vaultAddressPadded = vaultAddress.slice(2).padStart(64, '0')

      // approve(address spender, uint256 amount) signature: 0x095ea7b3
      const approveData = '0x095ea7b3' + vaultAddressPadded + approveAmount

      // Send approve transaction
      await this.sendTransaction(usdcAddress, approveData)

      // Then deposit to vault (this is a simplified example)
      // deposit(uint256 amount) signature would depend on your contract
      const depositData = '0x' // Replace with actual deposit function signature + amount

      const txHash = await this.sendTransaction(vaultAddress, depositData)
      return txHash
    } catch (error) {
      console.error('Error depositing to event:', error)
      throw new Error(`Deposit failed: ${error}`)
    }
  }

  async createEventATFi(
    stakeAmount: string,
    registrationDeadline: number,
    eventDate: number,
    maxParticipant: number,
    preferredWalletAddress?: string
  ): Promise<{ eventId: number; txHash: string }> {
    const provider = this.provider || window.ethereum;

    if (!provider) {
      throw new Error('No wallet provider available')
    }

    // Check if connected address matches organizer or use provided organizer
    const connectedAddress = await this.connectWallet();
    if (!connectedAddress) {
      throw new Error('Wallet not connected')
    }

    // If preferred wallet address is provided, ensure it matches the connected address
    if (preferredWalletAddress && connectedAddress.toLowerCase() !== preferredWalletAddress.toLowerCase()) {
      console.warn(`Warning: Connected wallet (${connectedAddress}) does not match preferred wallet (${preferredWalletAddress}). Using connected wallet.`);
    }

    try {
      // Import the contract utilities
      const { encodeCreateEventCalldata } = await import('./contracts/abi');
      const factoryConfig = await import('./contracts/factory');
      const CURRENT_NETWORK = factoryConfig.CURRENT_NETWORK;
      const CONTRACT_ADDRESSES = factoryConfig.CONTRACT_ADDRESSES;

      // Debug: Check if contract configuration is loaded correctly
      console.log('Debug: CURRENT_NETWORK:', CURRENT_NETWORK);
      console.log('Debug: CONTRACT_ADDRESSES:', CONTRACT_ADDRESSES);
      console.log('Debug: CONTRACT_ADDRESSES[CURRENT_NETWORK]:', CONTRACT_ADDRESSES[CURRENT_NETWORK]);

      // Validate network configuration
      if (!CONTRACT_ADDRESSES[CURRENT_NETWORK]) {
        throw new Error(`Network ${CURRENT_NETWORK} is not configured. Available networks: ${Object.keys(CONTRACT_ADDRESSES).join(', ')}`);
      }

      if (!CONTRACT_ADDRESSES[CURRENT_NETWORK].FACTORY_ATFI) {
        throw new Error(`Factory ATFi contract address is not configured for network ${CURRENT_NETWORK}`);
      }

      // Convert stake amount to USDC smallest unit (6 decimals)
      const stakeAmountWei = (parseFloat(stakeAmount) * 1000000).toString();

      // Encode the function call data with correct parameter order
      const calldata = encodeCreateEventCalldata(
        stakeAmountWei,
        registrationDeadline,
        eventDate,
        maxParticipant
      );

      // Get factory contract address
      const factoryAddress = CONTRACT_ADDRESSES[CURRENT_NETWORK].FACTORY_ATFI;

      // Send transaction to factory contract
      const txHash = await this.sendTransaction(factoryAddress, calldata);

      // Wait for transaction confirmation and get receipt
      const receipt = await this.waitForTransaction(txHash);

      // Parse VaultCreated event to get eventId
      const eventId = this.parseEventIdFromReceipt(receipt);

      if (!eventId) {
        throw new Error('Failed to parse event ID from transaction receipt');
      }

      return {
        eventId,
        txHash
      };
    } catch (error) {
      console.error('Error creating event ATFi:', error);
      throw new Error(`Event creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async waitForTransaction(txHash: string): Promise<any> {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    let receipt = null;
    while (!receipt) {
      try {
        receipt = await window.ethereum.request({
          method: 'eth_getTransactionReceipt',
          params: [txHash],
        });

        if (!receipt) {
          // Wait 2 seconds before checking again
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        throw new Error(`Failed to get transaction receipt: ${error}`);
      }
    }
    return receipt;
  }

  private async getTransactionReceipt(txHash: string): Promise<any> {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      const receipt = await window.ethereum.request({
        method: 'eth_getTransactionReceipt',
        params: [txHash],
      });
      return receipt;
    } catch (error) {
      throw new Error(`Failed to get transaction receipt: ${error}`);
    }
  }

  private parseEventIdFromReceipt(receipt: any): number | null {
    if (!receipt || !receipt.logs) {
      console.error('No logs found in receipt');
      return null;
    }

    console.log('Parsing receipt logs:', receipt.logs);

    // The VaultCreated event signature: VaultCreated(uint256,address,address,uint256,uint256,uint256,uint256)
    // The keccak256 hash of this signature is needed for the topic
    // For now, let's look for logs that have the right structure

    for (const log of receipt.logs) {
      console.log('Processing log:', {
        address: log.address,
        topics: log.topics,
        data: log.data
      });

      // Check if this is a VaultCreated event
      // The first indexed parameter (eventId) should be in topics[1]
      if (log.topics && log.topics.length >= 2) {
        // topics[0] is the event signature hash
        // topics[1] should be the eventId (indexed)
        // topics[2] should be the vault address (indexed)
        // topics[3] should be the organizer address (indexed)

        const eventIdHex = log.topics[1];
        const eventId = parseInt(eventIdHex, 16);

        console.log('Found eventId:', eventId);

        if (eventId && eventId > 0) {
          return eventId;
        }
      }

      // If eventId is not indexed, try to parse it from the data field
      if (log.data) {
        try {
          // Remove 0x prefix
          const data = log.data.slice(2);

          // The first parameter in the data should be the eventId (32 bytes = 64 hex chars)
          const eventIdHex = data.slice(0, 64);
          const eventId = parseInt(eventIdHex, 16);

          console.log('Parsed eventId from data:', eventId);

          if (eventId && eventId > 0) {
            return eventId;
          }
        } catch (error) {
          console.error('Error parsing log data:', error);
        }
      }
    }

    console.error('VaultCreated event not found in receipt logs');
    return null;
  }

  // Go Live: Call depositToYieldSource function
  async goLive(vaultAddress: string): Promise<string> {
    if (!window.ethereum || !this.state.address) {
      throw new Error('Wallet not connected')
    }

    try {
      // Import vault ABI
      const { VAULT_FUNCTION_SIGNATURES } = await import('./contracts/vault');

      // depositToYieldSource() function signature
      const functionSignature = VAULT_FUNCTION_SIGNATURES.DEPOSIT_TO_YIELD;

      // Create calldata for depositToYieldSource() - no parameters needed
      const data = functionSignature;

      const txHash = await this.sendTransaction(vaultAddress, data);
      return txHash;
    } catch (error) {
      console.error('Error calling depositToYieldSource:', error);
      throw new Error(`Go Live failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Settle Event: Call settleEvent function with attended participants
  async settleEvent(vaultAddress: string, attendedParticipants: string[]): Promise<string> {
    if (!window.ethereum || !this.state.address) {
      throw new Error('Wallet not connected')
    }

    try {
      // Import vault ABI
      const { VAULT_FUNCTION_SIGNATURES } = await import('./contracts/vault');

      // settleEvent(address[]) function signature
      const functionSignature = VAULT_FUNCTION_SIGNATURES.SETTLE_EVENT;

      // Encode the attended participants array
      // Function signature: settleEvent(address[] calldata _attendedParticipants)
      const data = this.encodeSettleEventData(functionSignature, attendedParticipants);

      const txHash = await this.sendTransaction(vaultAddress, data);
      return txHash;
    } catch (error) {
      console.error('Error calling settleEvent:', error);
      throw new Error(`Settle Event failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Claim Reward: Call claimReward function
  async claimReward(vaultAddress: string): Promise<string> {
    if (!window.ethereum || !this.state.address) {
      throw new Error('Wallet not connected')
    }

    try {
      // Import vault ABI
      const { VAULT_FUNCTION_SIGNATURES } = await import('./contracts/vault');

      // claimReward() function signature
      const functionSignature = VAULT_FUNCTION_SIGNATURES.CLAIM_REWARD;

      // Create calldata for claimReward() - no parameters needed
      const data = functionSignature;

      const txHash = await this.sendTransaction(vaultAddress, data);
      return txHash;
    } catch (error) {
      console.error('Error calling claimReward:', error);
      throw new Error(`Claim Reward failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Helper function to encode settleEvent parameters
  private encodeSettleEventData(functionSignature: string, attendedParticipants: string[]): string {
    // Function signature: settleEvent(address[] calldata _attendedParticipants)
    // Function selector (4 bytes) + parameters encoding

    let data = functionSignature.slice(2); // Remove 0x prefix

    // Encode array length (pad to 32 bytes)
    const arrayLength = attendedParticipants.length.toString(16).padStart(64, '0');
    data += arrayLength;

    // Encode each address (pad to 32 bytes)
    for (const address of attendedParticipants) {
      const paddedAddress = address.slice(2).padStart(64, '0'); // Remove 0x and pad
      data += paddedAddress;
    }

    return '0x' + data;
  }

  // Get user reward amount from vault
  async getUserReward(vaultAddress: string, userAddress: string): Promise<string> {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      // Import vault ABI
      const { VAULT_FUNCTION_SIGNATURES } = await import('./contracts/vault');

      // getUserReward(address) function signature
      const functionSignature = VAULT_FUNCTION_SIGNATURES.USER_REWARD;

      // Pad the address to 32 bytes and remove the 0x prefix
      const paddedAddress = userAddress.slice(2).padStart(64, '0');

      // Create the calldata
      const data = functionSignature + paddedAddress;

      // Make the call
      const result = await this.callContract(vaultAddress, data);

      // Convert the result from hex to decimal
      const rewardHex = result;
      const rewardWei = parseInt(rewardHex, 16);
      const rewardUSDC = rewardWei / 1000000; // Convert from smallest unit to USDC

      return rewardUSDC.toString();
    } catch (error) {
      console.error('Error getting user reward:', error);
      return '0';
    }
  }

  // Check if event is settled
  async isEventSettled(vaultAddress: string): Promise<boolean> {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      // Import vault ABI
      const { VAULT_FUNCTION_SIGNATURES } = await import('./contracts/vault');

      // eventSettled() function signature
      const functionSignature = VAULT_FUNCTION_SIGNATURES.EVENT_SETTLED;

      // Create the calldata (no parameters needed)
      const data = functionSignature;

      // Make the call
      const result = await this.callContract(vaultAddress, data);

      // Convert result to boolean (0 = false, 1 = true)
      const isSettled = parseInt(result, 16) === 1;

      return isSettled;
    } catch (error) {
      console.error('Error checking event settlement:', error);
      return false;
    }
  }

  setupEventListeners(callbacks: {
    onAccountsChanged?: (accounts: string[]) => void
    onChainChanged?: (chainId: string) => void
    onConnect?: (connectInfo: { chainId: string }) => void
    onDisconnect?: (error: { code: number; message: string }) => void
  }): void {
    if (!window.ethereum) return

    if (callbacks.onAccountsChanged) {
      window.ethereum.on('accountsChanged', callbacks.onAccountsChanged)
    }

    if (callbacks.onChainChanged) {
      window.ethereum.on('chainChanged', callbacks.onChainChanged)
    }

    if (callbacks.onConnect) {
      window.ethereum.on('connect', callbacks.onConnect)
    }

    if (callbacks.onDisconnect) {
      window.ethereum.on('disconnect', callbacks.onDisconnect)
    }
  }
}

export const web3Service = new Web3Service()