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