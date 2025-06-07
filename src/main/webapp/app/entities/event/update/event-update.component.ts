import { Component, ElementRef, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AlertError } from 'app/shared/alert/alert-error.model';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { DataUtils, FileLoadError } from 'app/core/util/data-util.service';
import { IVenue } from 'app/entities/venue/venue.model';
import { VenueService } from 'app/entities/venue/service/venue.service';
import { IPersonProfile } from 'app/entities/person-profile/person-profile.model';
import { PersonProfileService } from 'app/entities/person-profile/service/person-profile.service';
import { EventService } from '../service/event.service';
import { IEvent } from '../event.model';
import { EventFormGroup, EventFormService } from './event-form.service';

@Component({
  selector: 'jhi-event-update',
  templateUrl: './event-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class EventUpdateComponent implements OnInit {
  isSaving = false;
  event: IEvent | null = null;

  venuesSharedCollection: IVenue[] = [];
  personProfilesSharedCollection: IPersonProfile[] = [];

  protected dataUtils = inject(DataUtils);
  protected eventManager = inject(EventManager);
  protected eventService = inject(EventService);
  protected eventFormService = inject(EventFormService);
  protected venueService = inject(VenueService);
  protected personProfileService = inject(PersonProfileService);
  protected elementRef = inject(ElementRef);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: EventFormGroup = this.eventFormService.createEventFormGroup();

  compareVenue = (o1: IVenue | null, o2: IVenue | null): boolean => this.venueService.compareVenue(o1, o2);

  comparePersonProfile = (o1: IPersonProfile | null, o2: IPersonProfile | null): boolean =>
    this.personProfileService.comparePersonProfile(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ event }) => {
      this.event = event;
      if (event) {
        this.updateForm(event);
      }

      this.loadRelationshipsOptions();
    });
  }

  byteSize(base64String: string): string {
    return this.dataUtils.byteSize(base64String);
  }

  openFile(base64String: string, contentType: string | null | undefined): void {
    this.dataUtils.openFile(base64String, contentType);
  }

  setFileData(event: Event, field: string, isImage: boolean): void {
    this.dataUtils.loadFileToForm(event, this.editForm, field, isImage).subscribe({
      error: (err: FileLoadError) =>
        this.eventManager.broadcast(new EventWithContent<AlertError>('singlesMeetup2App.error', { ...err, key: `error.file.${err.key}` })),
    });
  }

  clearInputImage(field: string, fieldContentType: string, idInput: string): void {
    this.editForm.patchValue({
      [field]: null,
      [fieldContentType]: null,
    });
    if (idInput && this.elementRef.nativeElement.querySelector(`#${idInput}`)) {
      this.elementRef.nativeElement.querySelector(`#${idInput}`).value = null;
    }
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const event = this.eventFormService.getEvent(this.editForm);
    if (event.id !== null) {
      this.subscribeToSaveResponse(this.eventService.update(event));
    } else {
      this.subscribeToSaveResponse(this.eventService.create(event));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IEvent>>): void {
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

  protected updateForm(event: IEvent): void {
    this.event = event;
    this.eventFormService.resetForm(this.editForm, event);

    this.venuesSharedCollection = this.venueService.addVenueToCollectionIfMissing<IVenue>(this.venuesSharedCollection, event.venue);
    this.personProfilesSharedCollection = this.personProfileService.addPersonProfileToCollectionIfMissing<IPersonProfile>(
      this.personProfilesSharedCollection,
      ...(event.participants ?? []),
    );
  }

  protected loadRelationshipsOptions(): void {
    this.venueService
      .query()
      .pipe(map((res: HttpResponse<IVenue[]>) => res.body ?? []))
      .pipe(map((venues: IVenue[]) => this.venueService.addVenueToCollectionIfMissing<IVenue>(venues, this.event?.venue)))
      .subscribe((venues: IVenue[]) => (this.venuesSharedCollection = venues));

    this.personProfileService
      .query()
      .pipe(map((res: HttpResponse<IPersonProfile[]>) => res.body ?? []))
      .pipe(
        map((personProfiles: IPersonProfile[]) =>
          this.personProfileService.addPersonProfileToCollectionIfMissing<IPersonProfile>(
            personProfiles,
            ...(this.event?.participants ?? []),
          ),
        ),
      )
      .subscribe((personProfiles: IPersonProfile[]) => (this.personProfilesSharedCollection = personProfiles));
  }
}
