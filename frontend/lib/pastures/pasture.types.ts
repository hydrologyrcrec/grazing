export type LatLngCoordinate = [latitude: number, longitude: number];

export type GeoJsonPosition = [longitude: number, latitude: number];

export type GeoJsonPolygon = {
  type: "Polygon";
  coordinates: GeoJsonPosition[][];
};

export type PastureResponse = {
  id: string;
  name: string;
  description: string | null;
  status: "ACTIVE" | "ARCHIVED";
  landUse: "GRAZING" | "HAY" | "MIXED" | "OTHER";
  grassType: string;
  color: string;
  coordinates: LatLngCoordinate[];
  centroid: LatLngCoordinate;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  areaAcres: number;
  grazeableAreaAcres: number;
  version: number;
  createdAt: string;
  updatedAt: string;
};
