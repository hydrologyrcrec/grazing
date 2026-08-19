export type PolygonCoordinate = [latitude: number, longitude: number];
export type PolygonCoordinates = PolygonCoordinate[];

export type PastureBoundarySelection = Readonly<{
  coordinates: PolygonCoordinates;
  areaAcres: number;
}>;

export type PastureLandUse = "Grazing" | "Hay" | "Mixed" | "Other";

export type Pasture = Readonly<{
  id: string;
  name: string;
  description: string;
  landUse: PastureLandUse;
  grassType: string;
  color: string;
  coordinates: PolygonCoordinates;
  areaAcres: number;
  grazeableAreaAcres: number;
  createdAt: string;
  updatedAt: string;
}>;

export type GeocodeResult = Readonly<{
  lat: number;
  lng: number;
  label: string;
  boundingBox?: number[];
}>;
