"use client";

import { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { parseParticipantQRData, isQRCodeValid } from "@/utils/qrCode";
import { checkInParticipant, Participant } from "@/utils/api/events";

interface IDetectedBarcode {
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  cornerPoints: Array<{
    x: number;
    y: number;
  }>;
  format: string;
  rawValue: string;
}

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: number;
  onCheckInSuccess?: (participantData: Participant) => void;
}

interface CheckInResult {
  success: boolean;
  message: string;
  participant?: any;
  error?: string;
}

export default function QRScanner({ isOpen, onClose, eventId, onCheckInSuccess }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(true);
  const [checkInResult, setCheckInResult] = useState<CheckInResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleScan = async (detectedCodes: IDetectedBarcode[]) => {
    if (detectedCodes.length === 0 || isProcessing) return;

    setIsProcessing(true);
    setIsScanning(false);

    try {
      // Parse QR code data
      const qrData = parseParticipantQRData(detectedCodes[0].rawValue);

      // Validate QR code is for this event
      if (qrData.event_id !== eventId) {
        setCheckInResult({
          success: false,
          message: "Invalid QR code for this event",
          error: `Invalid QR code. This QR is for event ${qrData.event_id}, but current event is ${eventId}`
        });
        return;
      }

      // QR codes no longer expire - they only use user_id and event_id
      // No timestamp validation needed

      // QR codes now use user_id and backend check-in API directly accepts user_id
      if (qrData.user_id) {
        console.log("🔍 QR code contains user_id, checking in directly:", qrData.user_id);

        // Call check-in API with user_id as expected by updated backend
        const checkInData = {
          event_id: eventId,
          user_id: qrData.user_id
        };

        console.log("🔍 Checking in participant using user_id:", qrData.user_id);
        const response = await checkInParticipant(checkInData);

        if (response.success) {
          setCheckInResult({
            success: true,
            message: response.message,
            participant: response.participant
          });
          onCheckInSuccess?.(response.participant);
        } else {
          setCheckInResult({
            success: false,
            message: response.message || "Check-in failed",
            error: response.message || "Check-in failed"
          });
        }
        return;
      }

      // Fallback to old format if user_address is available (for backward compatibility)
      if (qrData.user_address) {
        console.log("🔍 Using user_address from QR code (legacy format):", qrData.user_address);

        const checkInData = {
          event_id: eventId,
          user_address: qrData.user_address
        };

        console.log("🔍 Checking in participant using user_address:", qrData.user_address);
        const response = await checkInParticipant(checkInData);

        if (response.success) {
          setCheckInResult({
            success: true,
            message: response.message,
            participant: response.participant
          });
          onCheckInSuccess?.(response.participant);
        } else {
          setCheckInResult({
            success: false,
            message: response.message || "Check-in failed",
            error: response.message || "Check-in failed"
          });
        }
        return;
      }

      // No valid user identifier found
      console.error("❌ No user ID or user address available for check-in");
      setCheckInResult({
        success: false,
        message: "Invalid QR code format",
        error: "QR code does not contain valid participant information"
      });

    } catch (error) {
      console.error('QR scan processing error:', error);
      setCheckInResult({
        success: false,
        message: "QR code processing failed",
        error: error instanceof Error ? error.message : "Invalid QR code format"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleError = (error: Error) => {
    console.error('QR Scanner error:', error);
    setCheckInResult({
      success: false,
      message: "Camera error",
      error: "Camera error. Please check camera permissions."
    });
  };

  const resetScanner = () => {
    setCheckInResult(null);
    setIsScanning(true);
    setIsProcessing(false);
  };

  const handleClose = () => {
    resetScanner();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="bg-[#1a1d21] rounded-2xl border border-white/10 shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h3 className="text-2xl font-bold text-white">Check-in Participant</h3>
            <p className="text-gray-400 text-sm mt-1">Event ID: {eventId}</p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isScanning && !checkInResult && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-white mb-4">Position QR code in front of camera</p>
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg pointer-events-none z-10"></div>
                <Scanner
                  onScan={handleScan}
                  onError={handleError}
                  styles={{
                    container: {
                      borderRadius: '0.5rem',
                      overflow: 'hidden'
                    }
                  }}
                />
              </div>

              {isProcessing && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto mb-2"></div>
                  <p className="text-gray-300">Processing check-in...</p>
                </div>
              )}

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs font-medium text-blue-400">Tips</span>
                </div>
                <ul className="text-xs text-gray-300 space-y-1">
                  <li>• Ensure good lighting for better scanning</li>
                  <li>• Hold QR code steady and centered</li>
                  <li>• Check that the QR code is for this event</li>
                </ul>
              </div>
            </div>
          )}

          {/* Check-in Result */}
          {checkInResult && (
            <div className="space-y-4">
              {checkInResult.success ? (
                <div className="bg-green-500/20 backdrop-blur-lg border border-green-500/50 text-green-100 px-4 py-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-semibold">Check-in Successful!</span>
                  </div>
                  <p className="text-sm">{checkInResult.message}</p>

                  {checkInResult.participant && (
                    <div className="mt-3 text-xs space-y-1">
                      <p><span className="font-medium">Wallet:</span> {checkInResult.participant.user_address ?
                        `${checkInResult.participant.user_address.slice(0, 6)}...${checkInResult.participant.user_address.slice(-4)}` :
                        `ID: ${checkInResult.participant.user_id.slice(0, 8)}...`
                      }</p>
                      <p><span className="font-medium">Status:</span> Checked In</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-red-500/20 backdrop-blur-lg border border-red-500/50 text-red-100 px-4 py-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-semibold">Check-in Failed</span>
                  </div>
                  <p className="text-sm">{checkInResult.error}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                {checkInResult.success ? (
                  <button
                    onClick={handleClose}
                    className="flex-1 text-gray-900 bg-gray-100 hover:bg-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-all"
                  >
                    Done
                  </button>
                ) : (
                  <>
                    <button
                      onClick={resetScanner}
                      className="flex-1 text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-all"
                    >
                      Scan Again
                    </button>
                    <button
                      onClick={handleClose}
                      className="flex-1 text-gray-900 bg-gray-100 hover:bg-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-all"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}