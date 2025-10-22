// API utilities for event operations

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1";

export interface EventMetadataRequest {
  event_id: number;
  title: string;
  description: string;
  image_url: string | null;
  organizer_address: string;
}

export interface EventMetadataResponse {
  event: {
    event_id: number;
    vault_address: string;
    organizer_address: string;
    stake_amount: string;
    max_participant: number;
    current_participants?: number;
    registration_deadline: number;
    event_date: number;
    title: string;
    status: string;
    description?: string;
    image_url?: string;
    organizer_name?: string;
  };
  participant_count: number;
}

export const createEventMetadata = async (data: EventMetadataRequest): Promise<EventMetadataResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/events/metadata`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create event metadata: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating event metadata:", error);
    throw error;
  }
};

export const getEventDetails = async (eventId: string): Promise<EventMetadataResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get event details: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting event details:", error);
    throw error;
  }
};

export const getAllEvents = async (): Promise<{ events: EventMetadataResponse[] }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/events`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get events: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting events:", error);
    throw error;
  }
};

// Participant registration API
export interface RegisterUserRequest {
  event_id: number;
  user_address: string;
  transaction_hash: string;
  deposit_amount: string;
}

export interface RegisterUserResponse {
  success: boolean;
  message: string;
  participant?: {
    id: string;
    event_id: number;
    user_address: string;
    deposit_amount: string;
    transaction_hash: string;
    created_at: string;
  };
}

export const registerUser = async (data: RegisterUserRequest): Promise<RegisterUserResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/events/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to register user: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
};

// Participant tracking APIs
export interface Participant {
  id: string;
  event_id: number;
  user_id: string;
  user_address: string;
  is_attend: boolean;
  is_claim: boolean;
  created_at: string;
  updated_at: string;
}

export interface CheckInRequest {
  event_id: number;
  user_address?: string;
  user_id?: string;
}

export interface CheckInResponse {
  success: boolean;
  message: string;
  participant?: Participant;
}

export interface ClaimRewardRequest {
  event_id: number;
  user_address: string;
}

export interface ClaimRewardResponse {
  success: boolean;
  message: string;
  participant?: Participant;
}

export interface ParticipantQRData {
  event_id: number;
  user_address: string;
  user_id?: string;
  timestamp: number;
}

// Check in participant (scan QR code)
export const checkInParticipant = async (data: CheckInRequest): Promise<CheckInResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/checkin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to check in participant: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error checking in participant:", error);
    throw error;
  }
};

// Claim reward (update participant status)
export const claimReward = async (data: ClaimRewardRequest): Promise<ClaimRewardResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/claim`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to claim reward: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error claiming reward:", error);
    throw error;
  }
};

// Get participant status
export const getParticipantStatus = async (eventId: number, userAddress: string): Promise<{
  participant: Participant | null;
}> => {
  try {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/participant/${userAddress}`);

    if (!response.ok) {
      if (response.status === 404) {
        return { participant: null };
      }
      const errorText = await response.text();
      throw new Error(`Failed to get participant status: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting participant status:", error);
    throw error;
  }
};

// Get all participants for an event
export const getEventParticipants = async (eventId: string): Promise<Participant[]> => {
  try {
    console.log(`🔍 Fetching participants for event ${eventId} from: ${API_BASE_URL}/events/${eventId}/participants`);

    // First try the dedicated participants endpoint
    let response = await fetch(`${API_BASE_URL}/events/${eventId}/participants`);
    console.log(`📊 API Response Status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const data = await response.json();
      console.log(`📋 Raw API Response Data:`, data);
      const participants = data.participants || data || [];
      console.log(`👥 Processed participants array:`, participants);
      console.log(`📈 Total participants found:`, participants.length);
      return participants;
    }

    // If participants endpoint doesn't exist (404), get event details instead
    if (response.status === 404) {
      console.log(`🔄 Participants endpoint not found, trying event details endpoint...`);
      const eventResponse = await fetch(`${API_BASE_URL}/events/${eventId}`);

      if (!eventResponse.ok) {
        throw new Error(`Failed to get event details: ${eventResponse.status}`);
      }

      const eventData = await eventResponse.json();
      console.log(`📊 Event data received:`, eventData);

      const participantCount = eventData.participant_count || 0;
      console.log(`👥 Participant count from event details: ${participantCount}`);

      // Since backend doesn't provide individual participant data,
      // we cannot show the actual participant list
      // Return empty array and let UI handle the display appropriately
      console.log(`⚠️ Backend doesn't provide individual participant data. Only count available: ${participantCount}`);
      return [];
    }

    // For other errors
    const errorText = await response.text();
    console.error(`❌ API Error Response:`, errorText);
    throw new Error(`Failed to get event participants: ${response.status} - ${errorText}`);

  } catch (error) {
    console.error("❌ Error getting event participants:", error);
    // Return empty array on error to prevent UI crashes
    return [];
  }
};