import { ethers, BrowserProvider, Contract, formatUnits, parseUnits } from 'ethers';
import { VAULT_ABI, VAULT_FUNCTION_SIGNATURES, USDC_ABI, USDC_FUNCTION_SIGNATURES } from './contracts/vault';
import { CONTRACT_ADDRESSES, CURRENT_NETWORK } from './contracts/factory';
import { web3Service } from './web3';

export interface VaultInfo {
  eventId: number;
  organizer: string;
  stakeAmount: string;
  registrationDeadline: number;
  eventDate: number;
  maxParticipant: number;
  currentParticipants: number;
  hasUserDeposited: boolean;
  hasUserAttended: boolean;
  hasUserClaimed: boolean;
  claimableRewards: string;
}

export interface DepositFlowState {
  status: 'idle' | 'checking_balance' | 'approving' | 'depositing' | 'registering' | 'completed' | 'error';
  step: number;
  totalSteps: number;
  message: string;
  error?: string;
}

export class VaultService {
  private provider: any = null;

  constructor(provider?: any) {
    this.provider = provider;
  }

  /**
   * Get vault information from the smart contract
   */
  async getVaultInfo(vaultAddress: string, userAddress: string): Promise<VaultInfo> {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed');
      }

      // Create contract instance
      const contract = new Contract(vaultAddress, VAULT_ABI, new BrowserProvider(window.ethereum));

      // Get vault data
      const [
        eventId,
        organizer,
        stakeAmount,
        registrationDeadline,
        eventDate,
        maxParticipant,
        participantCount,
        participantInfo
      ] = await Promise.all([
        contract.eventId(),
        contract.organizer(),
        contract.stakeAmount(),
        contract.registrationDeadline(),
        contract.eventDate(),
        contract.maxParticipant(),
        contract.getParticipantCount(),
        contract.participants(userAddress)
      ]);

      return {
        eventId: eventId.toNumber(),
        organizer,
        stakeAmount: formatUnits(stakeAmount, 6), // USDC has 6 decimals
        registrationDeadline: registrationDeadline.toNumber(),
        eventDate: eventDate.toNumber(),
        maxParticipant: maxParticipant.toNumber(),
        currentParticipants: participantCount.toNumber(),
        hasUserDeposited: participantInfo.hasDeposited,
        hasUserAttended: participantInfo.hasAttended,
        hasUserClaimed: participantInfo.hasClaimed,
        claimableRewards: formatUnits(participantInfo.claimableRewards, 6)
      };
    } catch (error) {
      console.error('Error getting vault info:', error);
      throw new Error(`Failed to get vault info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check user's USDC balance
   */
  async checkUSDCBalance(userAddress: string): Promise<string> {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed');
      }

      const usdcAddress = CONTRACT_ADDRESSES[CURRENT_NETWORK].USDC;
      const provider = new BrowserProvider(window.ethereum);
      const usdcContract = new Contract(usdcAddress, USDC_ABI, provider);

      const balance = await usdcContract.balanceOf(userAddress);
      return formatUnits(balance, 6); // USDC has 6 decimals
    } catch (error) {
      console.error('Error checking USDC balance:', error);
      throw new Error(`Failed to check USDC balance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check current USDC allowance for vault
   */
  async checkUSDCAllowance(userAddress: string, vaultAddress: string): Promise<string> {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed');
      }

      const usdcAddress = CONTRACT_ADDRESSES[CURRENT_NETWORK].USDC;
      const provider = new BrowserProvider(window.ethereum);
      const usdcContract = new Contract(usdcAddress, USDC_ABI, provider);

      const allowance = await usdcContract.allowance(userAddress, vaultAddress);
      return formatUnits(allowance, 6);
    } catch (error) {
      console.error('Error checking USDC allowance:', error);
      throw new Error(`Failed to check USDC allowance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Approve USDC for vault deposit
   */
  async approveUSDC(userAddress: string, vaultAddress: string, amount: string): Promise<string> {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed');
      }

      // Validate inputs
      if (!userAddress || !vaultAddress || !amount) {
        throw new Error('Invalid input parameters for USDC approval');
      }

      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error('Invalid amount for USDC approval');
      }

      const usdcAddress = CONTRACT_ADDRESSES[CURRENT_NETWORK].USDC;
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const usdcContract = new Contract(usdcAddress, USDC_ABI, signer);

      // Check user's USDC balance first
      const balance = await usdcContract.balanceOf(userAddress);
      const balanceNum = parseFloat(formatUnits(balance, 6));

      if (balanceNum < amountNum) {
        throw new Error(`Insufficient USDC balance. Available: ${balanceNum.toFixed(2)} USDC, Required: ${amountNum.toFixed(2)} USDC`);
      }

      // Convert amount to wei (USDC has 6 decimals)
      const amountWei = parseUnits(amount, 6);

      console.log(`Approving ${amount} USDC (${amountWei} wei) for vault ${vaultAddress}`);

      // Approve USDC
      const tx = await usdcContract.approve(vaultAddress, amountWei);
      return tx.hash;
    } catch (error: any) {
      console.error('Error approving USDC:', error);

      // Provide more specific error messages
      if (error?.message) {
        if (error.message.includes('insufficient funds')) {
          throw new Error('Insufficient funds for gas fees. Please add ETH to your wallet.');
        } else if (error.message.includes('execution reverted')) {
          throw new Error('USDC approval failed. This could be due to:\n' +
                       '• Insufficient USDC balance\n' +
                       '• Invalid vault contract address\n' +
                       '• Network connectivity issues');
        } else if (error.message.includes('user rejected transaction')) {
          throw new Error('Transaction was cancelled by user.');
        }
      }

      throw new Error(`Failed to approve USDC: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Deposit USDC to vault
   */
  async depositToVault(vaultAddress: string): Promise<string> {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed');
      }

      if (!vaultAddress) {
        throw new Error('Invalid vault address');
      }

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const vaultContract = new Contract(vaultAddress, VAULT_ABI, signer);

      console.log('Depositing to vault:', vaultAddress);

      // Call deposit function
      const tx = await vaultContract.deposit();
      return tx.hash;
    } catch (error: any) {
      console.error('Error depositing to vault:', error);

      // Provide more specific error messages
      if (error?.message) {
        if (error.message.includes('insufficient funds')) {
          throw new Error('Insufficient funds for gas fees. Please add ETH to your wallet.');
        } else if (error.message.includes('execution reverted')) {
          throw new Error('Vault deposit failed. This could be due to:\n' +
                       '• Insufficient USDC allowance\n' +
                       '• Invalid vault contract address\n' +
                       '• Vault is not accepting deposits\n' +
                       '• Registration period has ended');
        } else if (error.message.includes('user rejected transaction')) {
          throw new Error('Transaction was cancelled by user.');
        }
      }

      throw new Error(`Failed to deposit to vault: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Complete deposit flow with approval and deposit
   */
  async completeDepositFlow(
    vaultAddress: string,
    userAddress: string,
    amount: string,
    onStateChange?: (state: DepositFlowState) => void
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    const updateState = (state: Partial<DepositFlowState>) => {
      if (onStateChange) {
        onStateChange({
          status: 'idle',
          step: 0,
          totalSteps: 3,
          message: '',
          ...state
        });
      }
    };

    try {
      // Step 1: Check USDC balance
      updateState({
        status: 'checking_balance',
        step: 1,
        message: 'Checking USDC balance...'
      });

      const balance = await this.checkUSDCBalance(userAddress);
      const balanceNum = parseFloat(balance);
      // Convert amount from database units to USDC (database stores in smallest units: 1 USDC = 1,000,000)
      const amountNum = parseFloat(amount) / 1000000;

      if (balanceNum < amountNum) {
        throw new Error(`Insufficient USDC balance. Required: ${amountNum.toFixed(2)} USDC, Available: ${balanceNum.toFixed(2)} USDC`);
      }

      // Step 2: Approve USDC
      updateState({
        status: 'approving',
        step: 2,
        message: 'Approving USDC for deposit...'
      });

      // Check current allowance
      const currentAllowance = await this.checkUSDCAllowance(userAddress, vaultAddress);
      if (parseFloat(currentAllowance) < amountNum) {
        const approveTxHash = await this.approveUSDC(userAddress, vaultAddress, amountNum.toString());
        console.log('USDC approval transaction:', approveTxHash);

        // Wait for approval confirmation
        await this.waitForTransaction(approveTxHash);
      }

      // Step 3: Deposit to vault
      updateState({
        status: 'depositing',
        step: 3,
        message: 'Depositing USDC to vault...'
      });

      const depositTxHash = await this.depositToVault(vaultAddress);
      console.log('Vault deposit transaction:', depositTxHash);

      // Wait for deposit confirmation
      await this.waitForTransaction(depositTxHash);

      updateState({
        status: 'completed',
        step: 3,
        message: 'Deposit completed successfully!'
      });

      return { success: true, txHash: depositTxHash };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      updateState({
        status: 'error',
        step: 0,
        message: 'Deposit failed',
        error: errorMessage
      });

      return { success: false, error: errorMessage };
    }
  }

  /**
   * Wait for transaction confirmation
   */
  private async waitForTransaction(txHash: string): Promise<void> {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    const provider = new BrowserProvider(window.ethereum);

    // Poll for transaction receipt
    let receipt = null;
    while (!receipt) {
      try {
        receipt = await provider.getTransactionReceipt(txHash);
        if (!receipt) {
          // Wait 2 seconds before checking again
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        throw new Error(`Failed to get transaction receipt: ${error}`);
      }
    }

    if (receipt.status !== 1) {
      throw new Error('Transaction failed');
    }
  }

  /**
   * Get user's deposit status
   */
  async getUserDepositStatus(vaultAddress: string, userAddress: string): Promise<{
    hasDeposited: boolean;
    hasAttended: boolean;
    hasClaimed: boolean;
    claimableRewards: string;
  }> {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed');
      }

      const contract = new Contract(vaultAddress, VAULT_ABI, new BrowserProvider(window.ethereum));
      const participantInfo = await contract.participants(userAddress);

      return {
        hasDeposited: participantInfo.hasDeposited,
        hasAttended: participantInfo.hasAttended,
        hasClaimed: participantInfo.hasClaimed,
        claimableRewards: formatUnits(participantInfo.claimableRewards, 6)
      };
    } catch (error) {
      console.error('Error getting user deposit status:', error);
      throw new Error(`Failed to get user deposit status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Claim rewards from vault
   */
  async claimRewards(vaultAddress: string): Promise<string> {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed');
      }

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const vaultContract = new Contract(vaultAddress, VAULT_ABI, signer);

      const tx = await vaultContract.claimReward();
      return tx.hash;
    } catch (error) {
      console.error('Error claiming rewards:', error);
      throw new Error(`Failed to claim rewards: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export default VaultService;