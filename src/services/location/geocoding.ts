export interface GeocodeResult {
  latitude: string;
  longitude: string;
}

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

export const geocodeAddress = async (
  address: string,
): Promise<GeocodeResult> => {
  if (!address || !address.trim()) {
    throw new Error('Address is empty');
  }

  const encodedAddress = encodeURIComponent(address.trim());
  const url = `${NOMINATIM_BASE_URL}/search?q=${encodedAddress}&format=json&limit=1`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'User-Agent': 'DhwaniPartner/1.0.0',
    },
  });

  if (!response.ok) {
    throw new Error(
      `Geocoding failed: ${response.status} ${response.statusText}`,
    );
  }

  const data: Array<{lat?: string; lon?: string}> = await response.json();

  if (!data || data.length === 0) {
    throw new Error('Geocoding returned no results for the given address');
  }

  const result = data[0];

  if (!result.lat || !result.lon) {
    throw new Error('Geocoding failed: missing coordinates in response');
  }

  return {
    latitude: result.lat,
    longitude: result.lon,
  };
};
