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

  async connectWallet(): Promise<string> {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed')
    }

    try {
      this.state.isConnecting = true
      this.state.error = null

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      })

      if (accounts.length === 0) {
        throw new Error('No accounts found')
      }

      const account = accounts[0]
      const chainId = await window.ethereum.request({
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
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed')
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      })
    } catch (error: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (error.code === 4902) {
        // You could add chain configuration here if needed
        throw new Error('Chain not found in MetaMask')
      }
      throw error
    }
  }

  async sendTransaction(to: string, data: string, value: string = '0x0'): Promise<string> {
    if (!window.ethereum || !this.state.address) {
      throw new Error('Wallet not connected')
    }

    try {
      const transactionParams = {
        from: this.state.address,
        to,
        data,
        value,
      }

      const txHash = await window.ethereum.request({
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
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed')
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
      const result = await this.callContract(usdcAddress, data)

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

  async createEventVault(
    stakeAmount: string,
    maxParticipants: number,
    registrationDeadline: number,
    eventDate: number
  ): Promise<{ vaultAddress: string; eventId: number; txHash: string }> {
    if (!window.ethereum || !this.state.address) {
      throw new Error('Wallet not connected')
    }

    try {
      // Convert parameters to contract format
      const stakeAmountWei = (parseFloat(stakeAmount) * 1000000).toString(16)
      const maxParticipantsHex = maxParticipants.toString(16).padStart(64, '0')
      const deadlineHex = registrationDeadline.toString(16).padStart(64, '0')
      const eventDateHex = eventDate.toString(16).padStart(64, '0')

      // Example factory contract address - replace with your actual factory contract
      const factoryAddress = '0x1234567890123456789012345678901234567890' // Replace with actual factory contract

      // Function signature for createVault(uint256,uint256,uint256,uint256)
      // This would need to match your actual smart contract ABI
      const functionSignature = '0xabcd1234' // Replace with actual function signature

      // Create calldata
      const stakeAmountPadded = `0x${stakeAmountWei.padStart(64, '0')}`
      const data = functionSignature + stakeAmountPadded.slice(2) + maxParticipantsHex + deadlineHex + eventDateHex

      // Send transaction to create vault
      const txHash = await this.sendTransaction(factoryAddress, data)

      // In a real implementation, you would:
      // 1. Wait for transaction confirmation
      // 2. Parse the transaction logs or return value to get vault address and event ID
      // For now, we'll simulate this with a placeholder implementation

      // Simulate getting vault address and event ID from transaction receipt
      // In reality, you'd parse the event logs from the transaction receipt
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate blockchain confirmation time

      const eventId = Math.floor(Math.random() * 1000000) // Simulated event ID
      const vaultAddress = `0x${Math.random().toString(16).substr(2, 40)}` // Simulated vault address

      return {
        vaultAddress,
        eventId,
        txHash
      }
    } catch (error) {
      console.error('Error creating event vault:', error)
      throw new Error(`Event vault creation failed: ${error}`)
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