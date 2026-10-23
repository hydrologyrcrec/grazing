import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  HostListener,
  ElementRef,
  inject,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { GeocodeResult, GeocodingService } from '../data-access/geocoding.service';
import { apiErrorMessage } from '../../../core/http/api-error';

@Component({
  selector: 'app-address-search',
  imports: [FormsModule],
  templateUrl: './address-search.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddressSearchComponent {
  private readonly service = inject(GeocodingService);
  private readonly element = inject(ElementRef<HTMLElement>);
  readonly locationSelected = output<GeocodeResult>();
  readonly query = signal('');
  readonly results = signal<GeocodeResult[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');
  private request: Subscription | null = null;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.request?.unsubscribe());
  }
  @HostListener('document:click', ['$event'])
  closeOutside(event: MouseEvent): void {
    if (!this.element.nativeElement.contains(event.target as Node)) this.results.set([]);
  }
  changeQuery(value: string): void {
    this.request?.unsubscribe();
    this.query.set(value);
    this.results.set([]);
    this.error.set('');
    this.loading.set(false);
  }
  search(): void {
    this.request?.unsubscribe();
    const query = this.query().trim();
    if (query.length < 3 || query.length > 256 || query.includes(';')) {
      this.error.set('Enter a valid address of 3 to 256 characters.');
      return;
    }
    this.loading.set(true);
    this.error.set('');
    this.results.set([]);
    this.request = this.service.search(query).subscribe({
      next: (results) => {
        this.results.set(results);
        this.loading.set(false);
        if (!results.length) this.error.set('No matching address found.');
      },
      error: (error) => {
        this.error.set(apiErrorMessage(error, 'Address search failed.'));
        this.loading.set(false);
      },
    });
  }
  select(result: GeocodeResult): void {
    this.query.set(result.label);
    this.results.set([]);
    this.error.set('');
    this.locationSelected.emit(result);
  }
  dismiss(): void {
    this.results.set([]);
  }
}
