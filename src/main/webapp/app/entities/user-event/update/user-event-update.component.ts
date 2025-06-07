import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IPersonProfile } from 'app/entities/person-profile/person-profile.model';
import { PersonProfileService } from 'app/entities/person-profile/service/person-profile.service';
import { IEvent } from 'app/entities/event/event.model';
import { EventService } from 'app/entities/event/service/event.service';
import { PaymentStatus } from 'app/entities/enumerations/payment-status.model';
import { UserEventService } from '../service/user-event.service';
import { IUserEvent } from '../user-event.model';
import { UserEventFormGroup, UserEventFormService } from './user-event-form.service';

@Component({
  selector: 'jhi-user-event-update',
  templateUrl: './user-event-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class UserEventUpdateComponent implements OnInit {
  isSaving = false;
  userEvent: IUserEvent | null = null;
  paymentStatusValues = Object.keys(PaymentStatus);

  personProfilesSharedCollection: IPersonProfile[] = [];
  eventsSharedCollection: IEvent[] = [];

  protected userEventService = inject(UserEventService);
  protected userEventFormService = inject(UserEventFormService);
  protected personProfileService = inject(PersonProfileService);
  protected eventService = inject(EventService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: UserEventFormGroup = this.userEventFormService.createUserEventFormGroup();

  comparePersonProfile = (o1: IPersonProfile | null, o2: IPersonProfile | null): boolean =>
    this.personProfileService.comparePersonProfile(o1, o2);

  compareEvent = (o1: IEvent | null, o2: IEvent | null): boolean => this.eventService.compareEvent(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ userEvent }) => {
      this.userEvent = userEvent;
      if (userEvent) {
        this.updateForm(userEvent);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const userEvent = this.userEventFormService.getUserEvent(this.editForm);
    if (userEvent.id !== null) {
      this.subscribeToSaveResponse(this.userEventService.update(userEvent));
    } else {
      this.subscribeToSaveResponse(this.userEventService.create(userEvent));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IUserEvent>>): void {
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

  protected updateForm(userEvent: IUserEvent): void {
    this.userEvent = userEvent;
    this.userEventFormService.resetForm(this.editForm, userEvent);

    this.personProfilesSharedCollection = this.personProfileService.addPersonProfileToCollectionIfMissing<IPersonProfile>(
      this.personProfilesSharedCollection,
      userEvent.personProfile,
    );
    this.eventsSharedCollection = this.eventService.addEventToCollectionIfMissing<IEvent>(this.eventsSharedCollection, userEvent.event);
  }

  protected loadRelationshipsOptions(): void {
    this.personProfileService
      .query()
      .pipe(map((res: HttpResponse<IPersonProfile[]>) => res.body ?? []))
      .pipe(
        map((personProfiles: IPersonProfile[]) =>
          this.personProfileService.addPersonProfileToCollectionIfMissing<IPersonProfile>(personProfiles, this.userEvent?.personProfile),
        ),
      )
      .subscribe((personProfiles: IPersonProfile[]) => (this.personProfilesSharedCollection = personProfiles));

    this.eventService
      .query()
      .pipe(map((res: HttpResponse<IEvent[]>) => res.body ?? []))
      .pipe(map((events: IEvent[]) => this.eventService.addEventToCollectionIfMissing<IEvent>(events, this.userEvent?.event)))
      .subscribe((events: IEvent[]) => (this.eventsSharedCollection = events));
  }
}
