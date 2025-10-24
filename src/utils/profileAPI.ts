// Profile API integration for ATFi backend
import { web3Service } from './web3';

export interface Profile {
  id: string;
  wallet_address: string;
  name: string;
  email?: string;
  avatar?: string;
  balance?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProfileRequest {
  wallet_address: string;
  name: string;
  email?: string;
  avatar?: string;
  balance?: string;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  avatar?: string;
  balance?: string;
}

class ProfileAPI {
  private baseURL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/v1`;

  async createProfile(data: CreateProfileRequest): Promise<Profile> {
    const response = await fetch(`${this.baseURL}/profiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create profile');
    }

    return response.json();
  }

  async getProfile(walletAddress: string): Promise<Profile> {
    const response = await fetch(`${this.baseURL}/profiles/${walletAddress}`);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Profile not found');
      }
      const error = await response.json();
      throw new Error(error.error || 'Failed to get profile');
    }

    return response.json();
  }

  async updateProfile(walletAddress: string, data: UpdateProfileRequest): Promise<Profile> {
    const response = await fetch(`${this.baseURL}/profiles/${walletAddress}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update profile');
    }

    return response.json();
  }

  async upsertProfile(data: CreateProfileRequest): Promise<Profile> {
    const response = await fetch(`${this.baseURL}/profiles/upsert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upsert profile');
    }

    return response.json();
  }

  // Create or update profile when user signs in
  async handleSignIn(walletAddress: string, userName?: string): Promise<Profile & { balance: string }> {
    try {
      // Get user USDC balance from Base Sepolia
      const balance = await web3Service.getUSDCBalance(walletAddress);

      // Prepare profile data (balance is not stored in DB)
      const profileData: CreateProfileRequest = {
        wallet_address: walletAddress,
        name: userName || `User ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
      };

      // Use upsert to create or update profile
      const profile = await this.upsertProfile(profileData);

      // Add balance to the response
      return {
        ...profile,
        balance: balance,
      };
    } catch (error) {
      console.error('Error handling sign in:', error);
      throw error;
    }
  }

  // Get profile with current USDC balance
  async getProfileWithBalance(walletAddress: string): Promise<Profile & { balance: string }> {
    try {
      const profile = await this.getProfile(walletAddress);

      // Backend already provides the USDC balance from Base Sepolia contract
      // Use the backend balance directly (includes "0" as valid balance)
      let balance = profile.balance || '0';

      // Ensure balance is a valid string, fallback to "0" if invalid
      if (!balance || isNaN(Number(balance)) || balance === 'NaN') {
        console.warn('Invalid balance from backend, using "0"');
        balance = '0';
      }

      return {
        ...profile,
        balance: balance,
      };
    } catch (error) {
      console.error('Error getting profile with balance:', error);
      throw error;
    }
  }

  // Update user balance (returns profile with current balance)
  async updateBalance(walletAddress: string): Promise<Profile & { balance: string }> {
    try {
      const balance = await web3Service.getUSDCBalance(walletAddress);
      const profile = await this.getProfile(walletAddress);

      return {
        ...profile,
        balance: balance,
      };
    } catch (error) {
      console.error('Error updating balance:', error);
      throw error;
    }
  }
}

export const profileAPI = new ProfileAPI();