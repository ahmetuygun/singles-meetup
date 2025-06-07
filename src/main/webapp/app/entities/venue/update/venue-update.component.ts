import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IVenue } from '../venue.model';
import { VenueService } from '../service/venue.service';
import { VenueFormGroup, VenueFormService } from './venue-form.service';

@Component({
  selector: 'jhi-venue-update',
  templateUrl: './venue-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class VenueUpdateComponent implements OnInit {
  isSaving = false;
  venue: IVenue | null = null;

  protected venueService = inject(VenueService);
  protected venueFormService = inject(VenueFormService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: VenueFormGroup = this.venueFormService.createVenueFormGroup();

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ venue }) => {
      this.venue = venue;
      if (venue) {
        this.updateForm(venue);
      }
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const venue = this.venueFormService.getVenue(this.editForm);
    if (venue.id !== null) {
      this.subscribeToSaveResponse(this.venueService.update(venue));
    } else {
      this.subscribeToSaveResponse(this.venueService.create(venue));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IVenue>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: () => this.onSaveSuccess(),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveSuccess(): void {
    this.previousState();
  }

  protected onSaveError(): void {
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSaving = false;
  }

  protected updateForm(venue: IVenue): void {
    this.venue = venue;
    this.venueFormService.resetForm(this.editForm, venue);
  }
}
