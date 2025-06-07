import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { IVenue } from '../venue.model';

@Component({
  selector: 'jhi-venue-detail',
  templateUrl: './venue-detail.component.html',
  imports: [SharedModule, RouterModule],
})
export class VenueDetailComponent {
  venue = input<IVenue | null>(null);

  previousState(): void {
    window.history.back();
  }
}
