// Wallet service for smart wallet selection and management

export interface WalletInfo {
  id: string;
  address: string;
  type: 'gmail' | 'external';
  chainType?: string;
  walletClientType?: string;
  connectorType?: string;
  name?: string;
  email?: string;
}

// Import Privy's User type
import { User as PrivyUser } from '@privy-io/react-auth';

// Re-export for backward compatibility
export type { PrivyUser };

export class WalletService {
  /**
   * Get the best wallet for transactions based on user's linked accounts
   * Priority: Gmail-linked wallet > External wallets
   */
  static getPreferredWallet(user: PrivyUser): WalletInfo | null {
    if (!user) return null;

    // First, check for Gmail-linked wallets
    const gmailWallet = this.findGmailWallet(user);
    if (gmailWallet) {
      return gmailWallet;
    }

    // Fall back to primary wallet or any available wallet
    if (user.wallet) {
      return {
        id: user.wallet.id || '',
        address: user.wallet.address || '',
        type: 'external',
        name: 'External Wallet',
        chainType: user.wallet.chainType,
        walletClientType: user.wallet.walletClientType,
        connectorType: user.wallet.connectorType
      };
    }

    // Check linked accounts for wallets
    const linkedWallet = user.linkedAccounts?.find(
      (account: any) => account.type === 'wallet' && 'address' in account
    );
    if (linkedWallet && 'address' in linkedWallet) {
      return {
        id: (linkedWallet as any).id || '',
        address: (linkedWallet as any).address || '',
        type: 'external',
        name: 'Linked Wallet'
      };
    }

    return null;
  }

  /**
   * Find Gmail-linked wallet from user's linked accounts
   */
  private static findGmailWallet(user: PrivyUser): WalletInfo | null {
    if (!user.linkedAccounts || !user.google) return null;

    // Extract gmail info once to avoid undefined issues
    const gmailEmail = user.google.email.toLowerCase();
    const gmailVerifiedTime = user.google.subject ? new Date(user.google.subject).getTime() : 0;

    const gmailWallet = user.linkedAccounts.find((account: any) => {
      if (account.type !== 'wallet') return false;

      // Check if wallet is linked to Gmail account
      if (account.email) {
        return account.email.toLowerCase() === gmailEmail;
      }

      // Check if wallet was created around the same time as Gmail account verification
      const walletTime = account.firstVerifiedAt ? new Date(account.firstVerifiedAt).getTime() : 0;
      const timeDiff = Math.abs(walletTime - gmailVerifiedTime);

      // If wallet was created within 24 hours of Gmail verification, assume it's linked
      return timeDiff < 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    });

    if (gmailWallet && 'address' in gmailWallet && gmailWallet.address) {
      return {
        id: (gmailWallet as any).id || '',
        address: (gmailWallet as any).address || '',
        type: 'gmail',
        name: `Gmail Wallet (${(gmailWallet as any).address?.slice(0, 6)}...${(gmailWallet as any).address?.slice(-4)})`,
        email: user.google.email
      };
    }

    return null;
  }

  /**
   * Get wallet display name
   */
  static getWalletDisplayName(wallet: WalletInfo): string {
    if (wallet.name) return wallet.name;
    if (wallet.email) return `${wallet.email} (${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)})`;
    return `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`;
  }

  /**
   * Format address for display
   */
  static formatAddress(address: string): string {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  /**
   * Validate if wallet is on the correct network
   */
  static async validateWalletNetwork(walletAddress: string, expectedChainId: number): Promise<boolean> {
    if (!window.ethereum) return false;

    try {
      const chainId = await window.ethereum.request({
        method: 'eth_chainId'
      });

      return parseInt(chainId, 16) === expectedChainId;
    } catch (error) {
      console.error('Failed to validate wallet network:', error);
      return false;
    }
  }

  /**
   * Get wallet balance in ETH
   */
  static async getWalletBalance(address: string): Promise<string> {
    if (!window.ethereum) return '0';

    try {
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest']
      });

      const balanceWei = parseInt(balance, 16);
      const balanceETH = balanceWei / Math.pow(10, 18);

      return balanceETH.toString();
    } catch (error) {
      console.error('Failed to get wallet balance:', error);
      return '0';
    }
  }

  /**
   * Get USDC balance for wallet
   */
  static async getUSDCBalance(address: string): Promise<string> {
    if (!window.ethereum) return '0';

    try {
      // USDC contract address on Base Sepolia
      const usdcAddress = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';

      // ERC20 balanceOf function signature: balanceOf(address)
      const functionSignature = '0x70a08231';

      // Pad the address to 32 bytes and remove the 0x prefix
      const paddedAddress = address.slice(2).padStart(64, '0');

      // Create the calldata
      const data = functionSignature + paddedAddress;

      // Make the call
      const result = await window.ethereum.request({
        method: 'eth_call',
        params: [
          {
            to: usdcAddress,
            data,
          },
          'latest',
        ],
      });

      // Convert the result from hex to decimal (USDC has 6 decimals)
      const balanceHex = result;
      const balanceWei = parseInt(balanceHex, 16);
      const balanceUSDC = balanceWei / 1000000; // Convert from smallest unit to USDC

      return balanceUSDC.toString();
    } catch (error) {
      console.error('Failed to get USDC balance:', error);
      return '0';
    }
  }
}

export default WalletService;