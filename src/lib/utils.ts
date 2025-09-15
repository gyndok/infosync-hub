import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const US_STATE_CODES = new Set([
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC','PR','VI','GU','AS','MP'
]);

export function normalizeLocationQuery(input: string): string {
  const raw = (input || '').trim();
  if (!raw) return raw;
  const parts = raw.split(',').map(p => p.trim()).filter(Boolean);

  if (parts.length === 2) {
    const [city, region] = parts;
    const regionUpper = region.toUpperCase();
    if (US_STATE_CODES.has(regionUpper)) {
      return `${city},${regionUpper},US`;
    }
    if (region.length === 2) {
      return `${city},${regionUpper}`;
    }
    return `${city},${region}`;
  }

  if (parts.length === 3) {
    const [city, region, country] = parts;
    return `${city},${region.toUpperCase()},${country.toUpperCase()}`;
  }

  return raw;
}
