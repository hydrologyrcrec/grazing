import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { LAND_USE_LABELS, Pasture } from '../../pastures/data-access/pasture.models';

@Component({
  selector: 'app-pasture-details',
  imports: [DecimalPipe],
  templateUrl: './pasture-details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PastureDetailsComponent {
  readonly pasture = input.required<Pasture>();
  readonly closed = output<void>();
  readonly landUseLabels = LAND_USE_LABELS;
}
