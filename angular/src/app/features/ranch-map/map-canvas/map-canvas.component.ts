import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  effect,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import * as L from 'leaflet';
import { AppConfigService } from '../../../core/config/app-config.service';
import { BoundarySelection, Pasture } from '../../pastures/data-access/pasture.models';
import { GeocodeResult } from '../data-access/geocoding.service';
import { PolygonDrawController } from './polygon-draw.controller';

@Component({
  selector: 'app-map-canvas',
  templateUrl: './map-canvas.component.html',
  styleUrl: './map-canvas.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapCanvasComponent implements AfterViewInit, OnDestroy {
  private readonly configuration = inject(AppConfigService).map;
  private readonly canvas = viewChild.required<ElementRef<HTMLDivElement>>('canvas');
  readonly pastures = input.required<readonly Pasture[]>();
  readonly focusPastureId = input<string | null>(null);
  readonly searchTarget = input<GeocodeResult | null>(null);
  readonly drawRequest = input(0);
  readonly pastureSelected = output<Pasture>();
  readonly boundarySelected = output<BoundarySelection>();
  private map: L.Map | null = null;
  private polygons: L.FeatureGroup | null = null;
  private draw: PolygonDrawController | null = null;
  private resize: ResizeObserver | null = null;
  private initialFocus = false;
  private lastDrawRequest = 0;
  private readonly reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  constructor() {
    effect(() => {
      this.renderPastures(this.pastures());
    });
    effect(() => {
      const id = this.focusPastureId();
      const pastures = this.pastures();
      const pasture = pastures.find((item) => item.id === id);
      if (pasture) this.focus(pasture);
    });
    effect(() => {
      const target = this.searchTarget();
      if (target) this.showLocation(target);
    });
    effect(() => {
      const request = this.drawRequest();
      if (request > this.lastDrawRequest) {
        this.lastDrawRequest = request;
        this.draw?.start();
      }
    });
  }
  ngAfterViewInit(): void {
    this.map = L.map(this.canvas().nativeElement, {
      center: this.configuration.center,
      zoom: this.configuration.zoom,
      maxZoom: this.configuration.maxZoom,
      zoomControl: false,
    });
    L.control.zoom({ position: this.configuration.zoomControlPosition }).addTo(this.map);
    for (const layer of this.configuration.tileLayers)
      L.tileLayer(layer.url, {
        maxNativeZoom: 18,
        maxZoom: this.configuration.maxZoom,
        attribution: layer.attribution,
      }).addTo(this.map);
    this.polygons = L.featureGroup().addTo(this.map);
    this.draw = new PolygonDrawController(this.map, (boundary) =>
      this.boundarySelected.emit(boundary),
    );
    this.resize = new ResizeObserver(() => this.map?.invalidateSize());
    this.resize.observe(this.canvas().nativeElement);
    this.renderPastures(this.pastures());
  }
  private renderPastures(pastures: readonly Pasture[]): void {
    if (!this.map || !this.polygons) return;
    this.polygons.clearLayers();
    for (const pasture of pastures) {
      const polygon = L.polygon(pasture.coordinates, {
        color: pasture.color,
        fillColor: pasture.color,
        fillOpacity: 0.34,
        weight: 3,
      });
      // Leaflet treats strings as HTML. Use a text node to prevent stored name XSS.
      const label = document.createElement('span');
      label.textContent = pasture.name;
      polygon.bindTooltip(label, {
        permanent: true,
        direction: 'top',
        offset: [0, -8],
        className: 'pasture-label',
      });
      polygon.on('click', () => this.pastureSelected.emit(pasture));
      polygon.addTo(this.polygons);
    }
    if (!this.initialFocus && pastures.length) {
      this.focus(pastures[0], false);
      this.initialFocus = true;
    }
  }
  private focus(pasture: Pasture, animate = true): void {
    this.map?.fitBounds(L.latLngBounds(pasture.coordinates), {
      padding: [70, 70],
      maxZoom: this.configuration.maxZoom,
      animate: animate && !this.reducedMotion,
    });
  }
  private showLocation(result: GeocodeResult): void {
    if (result.boundingBox?.length === 4 && result.boundingBox.every(Number.isFinite)) {
      const [south, north, west, east] = result.boundingBox;
      this.map?.fitBounds(
        [
          [south, west],
          [north, east],
        ],
        { padding: [30, 30], maxZoom: this.configuration.maxZoom, animate: !this.reducedMotion },
      );
    } else
      this.map?.flyTo([result.lat, result.lng], this.configuration.maxZoom, {
        animate: !this.reducedMotion,
      });
  }
  ngOnDestroy(): void {
    this.resize?.disconnect();
    this.draw?.destroy();
    this.map?.remove();
  }
}
