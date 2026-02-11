import { geocode } from "opencage-api-client";
import type { GeocodingRequest } from "opencage-api-client";

interface GeoLocation {
  latitude: number;
  longitude: number;
}

export async function geoLocation(data: GeoLocation) {
  const input: GeocodingRequest = {
    q: `${data.latitude}, ${data.longitude}`,
    key: process.env.OPENCAGE_API_KEY || "",
    no_annotations: 1,
  };

  const result = await geocode(input);
  return result;
}

export function formatLocation(geocodeResult: any): string {
  if (!geocodeResult?.results?.[0]?.components) {
    return "Unknown Location";
  }

  const components = geocodeResult.results[0].components;

  const locality =
    components.suburb || components.neighbourhood || components.village || components.town;
  const city = components.city || components.state_district || components.county;

  if (locality && city) {
    return `${locality}, ${city}`;
  } else if (city) {
    return city;
  } else if (locality) {
    return locality;
  }

  return components.formatted || "Unknown Location";
}
