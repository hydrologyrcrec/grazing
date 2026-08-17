export type PolygonCoordinates = [number, number][]; // [latitude, longitude]

export type PastureDraft = {
  coordinates: PolygonCoordinates;
  areaAcres: number;
  createdAt: string;
};

export type Pasture = PastureDraft & {
  id: string;
  deviceId: string;
  name: string;
  grazeableAreaAcres: number;
  landUse: "Grazing" | "Hay";
  grassType: string;
  color: string;
  description: string;
  fsaIds: string;
  updatedAt: string;
};

export type GeocodeResult = {
  lat: number;
  lng: number;
  label: string;
  boundingBox?: number[];
};
