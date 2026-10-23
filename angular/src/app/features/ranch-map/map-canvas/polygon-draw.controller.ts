import * as L from 'leaflet';
import 'leaflet-draw';
import { BoundarySelection, Coordinate } from '../../pastures/data-access/pasture.models';
import { toAcres } from './area.utils';

export class PolygonDrawController {
  private active: L.Draw.Polygon | null = null;
  constructor(
    private readonly map: L.Map,
    private readonly onCreated: (boundary: BoundarySelection) => void,
  ) {
    this.map.on(L.Draw.Event.CREATED, this.created);
  }
  start(): void {
    this.map.stop();
    this.active?.disable();
    this.active = new L.Draw.Polygon(this.map as L.DrawMap, {
      allowIntersection: false,
      showArea: true,
      metric: false,
      shapeOptions: { color: '#f5a623', fillColor: '#f5a623', fillOpacity: 0.28, weight: 3 },
    });
    this.active.enable();
  }
  destroy(): void {
    this.active?.disable();
    this.map.off(L.Draw.Event.CREATED, this.created);
  }
  private readonly created = (event: L.LeafletEvent): void => {
    const created = event as L.DrawEvents.Created;
    if (created.layerType !== 'polygon' || !(created.layer instanceof L.Polygon)) return;
    const rings = created.layer.getLatLngs() as L.LatLng[][];
    const coordinates: Coordinate[] = rings[0].map(({ lat, lng }) => [lat, lng]);
    if (coordinates.length >= 3) this.onCreated({ coordinates, areaAcres: toAcres(coordinates) });
  };
}
