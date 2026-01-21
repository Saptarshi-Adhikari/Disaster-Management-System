import exifr from 'exifr';

/**
 * Extracts GPS coordinates from a file.
 * Returns { lat, lng } or null if data is missing.
 */
export const extractLocationFromImage = async (file: File) => {
  try {
    // We only need the GPS header to save memory
    const data = await exifr.gps(file);
    if (data && data.latitude && data.longitude) {
      return {
        lat: data.latitude,
        lng: data.longitude
      };
    }
    return null;
  } catch (error) {
    console.error("EXIF Extraction Error:", error);
    return null;
  }
};