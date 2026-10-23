import area from '@turf/area';
import { Coordinate } from '../../pastures/data-access/pasture.models';

export function toAcres(coordinates: Coordinate[]): number {
  if (coordinates.length < 3) return 0;
  const ring = coordinates.map(([lat, lng]) => [lng, lat]);
  if (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1])
    ring.push([...ring[0]]);
  return area({ type: 'Polygon', coordinates: [ring] }) / 4046.8564224;
}
