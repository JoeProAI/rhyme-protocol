/**
 * Google APIs Client - Maps, Places, Search
 * Powers location-based content and local SEO
 */

const GOOGLE_MAPS_API_URL = 'https://maps.googleapis.com/maps/api';
const GOOGLE_PLACES_API_URL = 'https://places.googleapis.com/v1';

interface PlaceSearchResult {
  id: string;
  displayName: { text: string };
  formattedAddress: string;
  rating?: number;
  userRatingCount?: number;
  types: string[];
  location: { latitude: number; longitude: number };
  photos?: { name: string }[];
  websiteUri?: string;
  nationalPhoneNumber?: string;
  regularOpeningHours?: {
    openNow: boolean;
    weekdayDescriptions: string[];
  };
}

interface PlaceDetailsResult extends PlaceSearchResult {
  reviews?: {
    rating: number;
    text: { text: string };
    authorAttribution: { displayName: string };
    relativePublishTimeDescription: string;
  }[];
  priceLevel?: string;
  editorialSummary?: { text: string };
}

interface NearbySearchParams {
  location: { lat: number; lng: number };
  radius: number; // in meters
  type?: string;
  keyword?: string;
  maxResults?: number;
}

interface TextSearchParams {
  query: string;
  location?: { lat: number; lng: number };
  radius?: number;
  maxResults?: number;
}

class GoogleClient {
  private apiKey: string;

  constructor() {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_MAPS_API_KEY environment variable is required');
    }
    this.apiKey = apiKey;
  }

  /**
   * Search for places by text query
   */
  async searchPlaces(params: TextSearchParams): Promise<PlaceSearchResult[]> {
    const response = await fetch(`${GOOGLE_PLACES_API_URL}/places:searchText`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': this.apiKey,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.types,places.location,places.photos,places.websiteUri,places.nationalPhoneNumber,places.regularOpeningHours',
      },
      body: JSON.stringify({
        textQuery: params.query,
        maxResultCount: params.maxResults || 10,
        locationBias: params.location ? {
          circle: {
            center: { latitude: params.location.lat, longitude: params.location.lng },
            radius: params.radius || 5000,
          },
        } : undefined,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Google Places API Error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.places || [];
  }

  /**
   * Search for nearby places
   */
  async nearbySearch(params: NearbySearchParams): Promise<PlaceSearchResult[]> {
    const response = await fetch(`${GOOGLE_PLACES_API_URL}/places:searchNearby`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': this.apiKey,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.types,places.location,places.photos',
      },
      body: JSON.stringify({
        locationRestriction: {
          circle: {
            center: { latitude: params.location.lat, longitude: params.location.lng },
            radius: params.radius,
          },
        },
        includedTypes: params.type ? [params.type] : undefined,
        maxResultCount: params.maxResults || 20,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Google Places API Error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.places || [];
  }

  /**
   * Get detailed place information
   */
  async getPlaceDetails(placeId: string): Promise<PlaceDetailsResult> {
    const response = await fetch(`${GOOGLE_PLACES_API_URL}/places/${placeId}`, {
      headers: {
        'X-Goog-Api-Key': this.apiKey,
        'X-Goog-FieldMask': 'id,displayName,formattedAddress,rating,userRatingCount,types,location,photos,websiteUri,nationalPhoneNumber,regularOpeningHours,reviews,priceLevel,editorialSummary',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Google Places API Error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  /**
   * Get photo URL for a place
   */
  getPhotoUrl(photoName: string, maxWidth: number = 400): string {
    return `${GOOGLE_PLACES_API_URL}/${photoName}/media?maxWidthPx=${maxWidth}&key=${this.apiKey}`;
  }

  /**
   * Geocode an address to coordinates
   */
  async geocode(address: string): Promise<{ lat: number; lng: number } | null> {
    const response = await fetch(
      `${GOOGLE_MAPS_API_URL}/geocode/json?address=${encodeURIComponent(address)}&key=${this.apiKey}`
    );

    if (!response.ok) {
      throw new Error('Geocoding failed');
    }

    const data = await response.json();
    if (data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return { lat: location.lat, lng: location.lng };
    }
    return null;
  }

  /**
   * Get static map image URL
   */
  getStaticMapUrl(params: {
    center: { lat: number; lng: number };
    zoom?: number;
    size?: string;
    markers?: { lat: number; lng: number; label?: string }[];
  }): string {
    const { center, zoom = 14, size = '600x400', markers = [] } = params;
    let url = `${GOOGLE_MAPS_API_URL}/staticmap?center=${center.lat},${center.lng}&zoom=${zoom}&size=${size}&key=${this.apiKey}`;
    
    markers.forEach((marker, i) => {
      const label = marker.label || String.fromCharCode(65 + i); // A, B, C...
      url += `&markers=label:${label}|${marker.lat},${marker.lng}`;
    });
    
    return url;
  }
}

let client: GoogleClient | null = null;

export function getGoogleClient(): GoogleClient {
  if (!client) {
    client = new GoogleClient();
  }
  return client;
}

export type { PlaceSearchResult, PlaceDetailsResult, NearbySearchParams, TextSearchParams };
