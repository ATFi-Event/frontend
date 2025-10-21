"use client";

import React, { useState } from "react";
import { usePrivy, useSendTransaction } from "@privy-io/react-auth";
import { encodeApproveUSDC, encodeDepositToVault } from "@/utils/contracts/abi";
import { CONTRACT_ADDRESSES, CURRENT_NETWORK } from "@/utils/contracts/factory";
import { registerUser } from "@/utils/api/events";
import WalletService from "@/utils/walletService";

interface DepositFlowState {
  status: 'idle' | 'checking_balance' | 'approving' | 'depositing' | 'registering' | 'completed' | 'error';
  step: number;
  totalSteps: number;
  message: string;
  error?: string;
}

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventData: {
    event_id: number;
    vault_address: string;
    stake_amount: string;
    title: string;
  };
  onSuccess?: () => void;
}

export default function DepositModal({ isOpen, onClose, eventData, onSuccess }: DepositModalProps) {
  const { authenticated, user } = usePrivy();
  const { sendTransaction } = useSendTransaction();
  const [depositState, setDepositState] = useState<DepositFlowState>({
    status: 'idle',
    step: 0,
    totalSteps: 3,
    message: ''
  });
  const [usdcBalance, setUsdcBalance] = useState<string>('0');

  const handleClose = () => {
    if (depositState.status !== 'depositing' && depositState.status !== 'approving') {
      setDepositState({
        status: 'idle',
        step: 0,
        totalSteps: 3,
        message: ''
      });
      onClose();
    }
  };

  const handleDeposit = async () => {
    if (!authenticated || !user) {
      alert('Please connect your wallet first');
      return;
    }

    // Get preferred wallet
    const preferredWallet = WalletService.getPreferredWallet(user);
    if (!preferredWallet) {
      alert('No wallet available for transaction');
      return;
    }

    console.log(`Using wallet for deposit: ${preferredWallet.name} (${preferredWallet.address})`);
    console.log(`Wallet type: ${preferredWallet.type === 'gmail' ? 'Gmail-linked wallet' : 'External wallet'}`);

    try {
      // Step 1: Check USDC balance
      setDepositState({
        status: 'checking_balance',
        step: 1,
        message: 'Checking USDC balance...'
      });

      const balance = await WalletService.getUSDCBalance(preferredWallet.address);
      const balanceNum = parseFloat(balance);
      const requiredBalance = parseInt(eventData.stake_amount) / 1000000;

      if (balanceNum < requiredBalance) {
        throw new Error(`Insufficient USDC balance. Required: ${requiredBalance.toFixed(2)} USDC, Available: ${balanceNum.toFixed(2)} USDC`);
      }

      // Step 2: Approve USDC
      setDepositState({
        status: 'approving',
        step: 2,
        message: 'Approving USDC for deposit...'
      });

      const usdcAddress = CONTRACT_ADDRESSES[CURRENT_NETWORK].USDC;
      const approveCalldata = encodeApproveUSDC(eventData.vault_address, eventData.stake_amount);

      const approveTxHash = await sendTransaction(
        {
          to: usdcAddress,
          data: approveCalldata,
        },
        {
          address: preferredWallet.address
        }
      );

      console.log('USDC approval transaction:', approveTxHash);

      // Step 3: Deposit to vault
      setDepositState({
        status: 'depositing',
        step: 3,
        message: 'Depositing USDC to vault...'
      });

      const depositCalldata = encodeDepositToVault();

      const depositTxHash = await sendTransaction(
        {
          to: eventData.vault_address,
          data: depositCalldata,
        },
        {
          address: preferredWallet.address
        }
      );

      console.log('Vault deposit transaction:', depositTxHash);

      setDepositState({
        status: 'completed',
        step: 3,
        message: 'Deposit completed successfully!'
      });

      // Register user in backend
      try {
        await registerUser({
          event_id: eventData.event_id,
          user_address: preferredWallet.address,
          transaction_hash: depositTxHash,
          deposit_amount: eventData.stake_amount
        });
      } catch (error) {
        console.error('Backend registration failed:', error);
        // Don't fail the whole flow if backend registration fails
      }

      setTimeout(() => {
        onSuccess?.();
        handleClose();
      }, 2000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setDepositState({
        status: 'error',
        step: 0,
        message: 'Deposit failed',
        error: errorMessage
      });
    }
  };

  const checkBalance = async () => {
    if (!user) return;

    const preferredWallet = WalletService.getPreferredWallet(user);
    if (!preferredWallet) return;

    try {
      const balance = await WalletService.getUSDCBalance(preferredWallet.address);
      setUsdcBalance(balance);
    } catch (error) {
      console.error('Failed to check balance:', error);
    }
  };

  // Check balance when modal opens
  React.useEffect(() => {
    if (isOpen && authenticated && user) {
      checkBalance();
    }
  }, [isOpen, authenticated, user]);

  if (!isOpen) return null;

  // Convert amounts from database (which stores in USDC smallest units: 1 USDC = 1,000,000)
  const requiredBalance = parseInt(eventData.stake_amount) / 1000000;
  const currentBalance = parseFloat(usdcBalance);
  const hasEnoughBalance = currentBalance >= requiredBalance;

  return (
    <div className="fixed inset-0 bg-[#131517]/95 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1d21] rounded-2xl border border-white/10 shadow-2xl max-w-md w-full p-6 relative">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          disabled={depositState.status === 'depositing' || depositState.status === 'approving'}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-white mb-2">Join Event</h3>
          <p className="text-gray-300">Deposit USDC to participate in</p>
          <p className="text-white font-medium">{eventData.title}</p>
        </div>

        {/* Wallet Info */}
        {authenticated && user && (
          <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-5L9 2H4z"/>
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-1">Using Wallet</p>
                <p className="text-sm font-medium text-white">
                  {WalletService.getPreferredWallet(user)?.type === 'gmail' ? '📧 Gmail Wallet' : '🦊 MetaMask'}
                </p>
                <p className="text-xs text-gray-400">
                  {WalletService.getPreferredWallet(user)?.address?.slice(0, 6)}...{WalletService.getPreferredWallet(user)?.address?.slice(-4)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Event Info */}
        <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-300 text-sm">Required Deposit</span>
            <span className="text-white font-bold text-lg">{requiredBalance.toFixed(2)} USDC</span>
          </div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-300 text-sm">Your USDC Balance</span>
            <span className={`font-bold text-lg ${hasEnoughBalance ? 'text-green-400' : 'text-red-400'}`}>
              {currentBalance.toFixed(2)} USDC
            </span>
          </div>

          {/* Balance Status Indicator */}
          <div className={`mt-3 p-3 rounded-lg border ${hasEnoughBalance ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
            <div className="flex items-center gap-2">
              {hasEnoughBalance ? (
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              <span className={`text-sm font-medium ${hasEnoughBalance ? 'text-green-400' : 'text-red-400'}`}>
                {hasEnoughBalance ? 'Sufficient Balance' : 'Insufficient Balance'}
              </span>
            </div>
            {!hasEnoughBalance && (
              <p className="text-red-300 text-sm mt-2">
                You need additional <span className="font-bold">{(requiredBalance - currentBalance).toFixed(2)} USDC</span> to participate
              </p>
            )}
          </div>
        </div>

        {/* Progress Indicator */}
        {depositState.status !== 'idle' && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white font-medium">Processing Deposit</span>
              <span className="text-purple-400 text-sm">
                Step {depositState.step} of {depositState.totalSteps}
              </span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(depositState.step / depositState.totalSteps) * 100}%` }}
              ></div>
            </div>
            <p className="text-purple-300 text-sm mt-2">{depositState.message}</p>
          </div>
        )}

        {/* Error Display */}
        {depositState.status === 'error' && (
          <div className="mb-6 bg-red-500/20 backdrop-blur-lg border border-red-500/50 text-red-100 px-4 py-3 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">{depositState.error}</span>
            </div>
          </div>
        )}

        {/* Success Display */}
        {depositState.status === 'completed' && (
          <div className="mb-6 bg-green-500/20 backdrop-blur-lg border border-green-500/50 text-green-100 px-4 py-3 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">Deposit completed successfully!</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 text-white bg-white/10 hover:bg-white/20 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-all disabled:opacity-50"
            disabled={depositState.status === 'depositing' || depositState.status === 'approving'}
          >
            Cancel
          </button>
          <button
            onClick={handleDeposit}
            disabled={
              !authenticated ||
              !hasEnoughBalance ||
              depositState.status === 'depositing' ||
              depositState.status === 'approving' ||
              depositState.status === 'completed'
            }
            className="flex-1 text-gray-900 bg-gray-100 hover:bg-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {depositState.status === 'depositing' || depositState.status === 'approving' ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                Processing...
              </div>
            ) : depositState.status === 'completed' ? (
              'Completed ✓'
            ) : (
              'Deposit USDC'
            )}
          </button>
        </div>

        {/* Info */}
        <div className="mt-4 bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span className="text-xs font-medium text-blue-400">Transaction Flow</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gray-600 flex items-center justify-center text-xs text-white">1</div>
              <span className="text-xs text-gray-400">Approve USDC for the vault contract</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gray-600 flex items-center justify-center text-xs text-white">2</div>
              <span className="text-xs text-gray-400">Deposit USDC to the event vault</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gray-600 flex items-center justify-center text-xs text-white">3</div>
              <span className="text-xs text-gray-400">Register your participation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}