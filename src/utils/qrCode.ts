import QRCode from 'qrcode';
import { ParticipantQRData } from './api/events';

export interface QRCodeOptions {
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

/**
 * Generate QR code data for participant
 */
export const generateParticipantQRData = (
  eventId: number,
  userId: string
): ParticipantQRData => {
  return {
    event_id: eventId,
    user_address: '', // Not used anymore
    user_id: userId,
    timestamp: Date.now() // Add current timestamp
  };
};

/**
 * Generate QR code as data URL for participant
 */
export const generateParticipantQRCode = async (
  eventId: number,
  userId: string,
  options: QRCodeOptions = {}
): Promise<string> => {
  const qrData = generateParticipantQRData(eventId, userId);
  const dataString = JSON.stringify(qrData);

  const defaultOptions: QRCodeOptions = {
    width: 256,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    },
    ...options
  };

  try {
    return await QRCode.toDataURL(dataString, defaultOptions);
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
};

/**
 * Parse QR code data to extract participant information
 */
export const parseParticipantQRData = (qrDataString: string): ParticipantQRData => {
  try {
    const parsed = JSON.parse(qrDataString);

    // Validate the structure - user_id is required now, user_address and timestamp are optional
    if (
      typeof parsed.event_id === 'number' &&
      typeof parsed.user_id === 'string'
    ) {
      return {
        event_id: parsed.event_id,
        user_address: parsed.user_address || undefined,
        user_id: parsed.user_id,
        timestamp: parsed.timestamp || undefined
      };
    }

    throw new Error('Invalid QR code data structure');
  } catch (error) {
    console.error('Error parsing QR code data:', error);
    throw new Error('Invalid QR code format');
  }
};

/**
 * Check if QR code is still valid (not expired)
 */
export const isQRCodeValid = (qrData: ParticipantQRData, maxAgeHours: number = 24): boolean => {
  const now = Date.now();
  const ageInHours = (now - qrData.timestamp) / (1000 * 60 * 60);
  return ageInHours <= maxAgeHours;
};

/**
 * Generate text representation of QR data for backup/manual entry
 */
export const generateQRCodeText = (eventId: number, userAddress: string, userId?: string): string => {
  const baseText = `ATFI-EVENT:${eventId}-USER:${userAddress.toLowerCase()}`;
  return userId ? `${baseText}-ID:${userId}` : baseText;
};

/**
 * Parse text representation back to QR data
 */
export const parseQRCodeText = (text: string): ParticipantQRData | null => {
  // Try to match pattern with user_id first
  const patternWithId = /ATFI-EVENT:(\d+)-USER:([a-fA-F0-9x]+)-ID:([a-zA-Z0-9_-]+)/;
  let match = text.match(patternWithId);

  if (match) {
    return {
      event_id: parseInt(match[1], 10),
      user_address: match[2].toLowerCase(),
      user_id: match[3],
      timestamp: Date.now() // Use current time as fallback
    };
  }

  // Fallback to pattern without user_id
  const patternWithoutId = /ATFI-EVENT:(\d+)-USER:([a-fA-F0-9x]+)/;
  match = text.match(patternWithoutId);

  if (match) {
    return {
      event_id: parseInt(match[1], 10),
      user_address: match[2].toLowerCase(),
      timestamp: Date.now() // Use current time as fallback
    };
  }

  return null;
};