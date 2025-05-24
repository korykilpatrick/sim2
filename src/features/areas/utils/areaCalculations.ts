import type { AreaGeometry } from '../types'

/**
 * Calculates the approximate area size in square kilometers for a polygon.
 * Uses a simplified calculation based on the spherical excess formula.
 *
 * @param geometry - The area geometry with coordinates
 * @returns Area size in square kilometers
 */
export function calculateAreaSize(geometry: AreaGeometry): number {
  // For a Polygon, coordinates[0] is the outer ring
  // For a MultiPolygon, we'd need to sum all polygons
  const ring =
    geometry.type === 'Polygon'
      ? geometry.coordinates[0]
      : geometry.coordinates[0][0] // First polygon of MultiPolygon

  // Simple approximation using the shoelace formula
  // For maritime areas, we'll use a rough estimate based on coordinates
  let area = 0
  const n = ring.length

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n
    const [x1, y1] = ring[i]
    const [x2, y2] = ring[j]
    area += x1 * y2
    area -= x2 * y1
  }

  area = Math.abs(area) / 2

  // Convert from square degrees to square kilometers (rough approximation)
  // At the equator, 1 degree ≈ 111 km
  const kmPerDegree = 111
  return area * kmPerDegree * kmPerDegree
}

/**
 * Validates if a polygon is valid for area monitoring.
 *
 * @param geometry - The area geometry to validate
 * @returns True if valid, false otherwise
 */
export function isValidAreaGeometry(geometry: AreaGeometry): boolean {
  const { type } = geometry

  // Must be a polygon or multipolygon
  if (type !== 'Polygon' && type !== 'MultiPolygon') return false

  if (type === 'Polygon') {
    const ring = geometry.coordinates[0]

    // Must have at least 3 points (4 including closing point)
    if (!ring || ring.length < 4) return false

    // First and last points must be the same (closed polygon)
    const first = ring[0]
    const last = ring[ring.length - 1]
    if (first[0] !== last[0] || first[1] !== last[1]) return false

    // All points must be valid coordinates
    for (const point of ring) {
      if (!Array.isArray(point) || point.length < 2) return false
      const [lng, lat] = point
      if (lng < -180 || lng > 180 || lat < -90 || lat > 90) return false
    }
  }

  return true
}

/**
 * Gets the center point of a polygon for map display.
 *
 * @param geometry - The area geometry
 * @returns Center point as [longitude, latitude]
 */
export function getAreaCenter(geometry: AreaGeometry): [number, number] {
  const ring =
    geometry.type === 'Polygon'
      ? geometry.coordinates[0]
      : geometry.coordinates[0][0] // First polygon of MultiPolygon

  let sumLng = 0
  let sumLat = 0
  const n = ring.length - 1 // Exclude closing point

  for (let i = 0; i < n; i++) {
    const [lng, lat] = ring[i]
    sumLng += lng
    sumLat += lat
  }

  return [sumLng / n, sumLat / n]
}

/**
 * Formats area size for display.
 *
 * @param sizeInKm - Area size in square kilometers
 * @returns Formatted string with appropriate units
 */
export function formatAreaSize(sizeInKm: number): string {
  if (sizeInKm < 1) {
    return `${Math.round(sizeInKm * 1000)} m²`
  } else if (sizeInKm < 1000) {
    return `${sizeInKm.toFixed(1)} km²`
  } else {
    return `${(sizeInKm / 1000).toFixed(1)}k km²`
  }
}
