const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export interface Event {
  event_id: number;
  vault_address: string;
  organizer_address: string;
  stake_amount: string;
  max_participant: number;
  current_participants: number;
  registration_deadline: number;
  event_date: number;
  title: string;
  status: string;
  description: string | null;
  image_url: string | null;
  organizer_name?: string;
}

export interface EventsResponse {
  events: Event[];
  limit: number;
  page: number;
  total: number;
}

export interface CreateEventRequest {
  event_id: number;
  title: string;
  description?: string;
  image_url?: string;
  organizer_address?: string;
}

class ApiService {
  private async fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${response.statusText}`);
    }

    return response.json();
  }

  async getEvents(
    page = 1,
    limit = 20,
    filters?: { status?: string; organizer?: string }
  ): Promise<EventsResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.organizer && { organizer: filters.organizer }),
    });

    const response = await this.fetchWithAuth(`/api/v1/events?${params}`);

    // Handle the actual backend response format
    if (response.events && Array.isArray(response.events)) {
      return {
        events: response.events,
        limit: response.limit || limit,
        page: response.page || page,
        total: response.total || 0,
      };
    } else if (Array.isArray(response)) {
      // Handle case where backend returns events array directly
      return {
        events: response,
        limit: limit,
        page: page,
        total: response.length,
      };
    } else {
      // Handle unexpected response format
      console.warn("Unexpected response format:", response);
      return {
        events: [],
        limit: limit,
        page: page,
        total: 0,
      };
    }
  }

  async getEvent(id: string): Promise<Event> {
    return this.fetchWithAuth(`/api/v1/events/${id}`);
  }

  async createEvent(eventData: CreateEventRequest): Promise<Event> {
    return this.fetchWithAuth("/api/v1/events", {
      method: "POST",
      body: JSON.stringify(eventData),
    });
  }

  async updateEventStatus(id: string, status: string): Promise<void> {
    return this.fetchWithAuth(`/api/v1/events/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  }

  // Settle event is now handled directly by frontend calling smart contract
  // async settleEvent(id: string, attendedParticipants: string[]): Promise<void> {
  //   return this.fetchWithAuth(`/api/v1/events/${id}/settle`, {
  //     method: 'PUT',
  //     body: JSON.stringify({ attended_participants: attendedParticipants }),
  //   })
  // }

  // Settle event after successful blockchain transaction
  async settleEvent(id: string): Promise<any> {
    return this.fetchWithAuth(`/api/v1/events/${id}/settle`, {
      method: "PUT",
    });
  }

  // Claim reward for participant
  async claimReward(eventId: string, userId: string): Promise<any> {
    return this.fetchWithAuth("/api/v1/claim", {
      method: "POST",
      body: JSON.stringify({
        event_id: parseInt(eventId),
        user_id: userId,
      }),
    });
  }
}

export const apiService = new ApiService();
