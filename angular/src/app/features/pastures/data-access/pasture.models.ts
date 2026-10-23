export type Coordinate = [latitude: number, longitude: number];
export type LandUse = 'GRAZING' | 'HAY' | 'MIXED' | 'OTHER';
export interface Pasture {
  id: string;
  name: string;
  description: string | null;
  status: 'ACTIVE' | 'ARCHIVED';
  landUse: LandUse;
  grassType: string;
  color: string;
  coordinates: Coordinate[];
  centroid: Coordinate;
  bounds: { north: number; south: number; east: number; west: number };
  areaAcres: number;
  grazeableAreaAcres: number;
  version: number;
  createdAt: string;
  updatedAt: string;
}
export interface PastureCreate {
  name: string;
  description: string | null;
  landUse: LandUse;
  grassType: string;
  color: string;
  coordinates: Coordinate[];
  grazeableAreaAcres: number;
}
export interface BoundarySelection {
  coordinates: Coordinate[];
  areaAcres: number;
}
export const LAND_USE_LABELS: Record<LandUse, string> = {
  GRAZING: 'Grazing',
  HAY: 'Hay',
  MIXED: 'Mixed',
  OTHER: 'Other',
};
