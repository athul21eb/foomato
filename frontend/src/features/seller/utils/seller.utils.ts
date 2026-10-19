/**
 * Formats distance accurately with 1 decimal place, minimum 0.1 km if <= 0.1 km.
 * Standard across all seller components (cards, profile views).
 */
export const formatDistance = (
  distKm?: number | null,
  distMeters?: number | null,
): string | null => {
  let km: number | null = null;
  if (distKm != null && !isNaN(Number(distKm))) {
    km = Number(distKm);
  } else if (distMeters != null && !isNaN(Number(distMeters))) {
    km = Number(distMeters) / 1000;
  }

  if (km == null) return null;

  // If between 0.0 and 0.1 km, display 0.1 km away
  if (km <= 0.1) {
    return '0.1 km';
  }

  return `${km.toFixed(1)} km`;
};
