import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IUser } from 'app/entities/user/user.model';
import { UserService } from 'app/entities/user/service/user.service';
import { IEvent } from 'app/entities/event/event.model';
import { EventService } from 'app/entities/event/service/event.service';
import { PersonProfileService } from '../service/person-profile.service';
import { IPersonProfile } from '../person-profile.model';
import { PersonProfileFormGroup, PersonProfileFormService } from './person-profile-form.service';

@Component({
  selector: 'jhi-person-profile-update',
  templateUrl: './person-profile-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class PersonProfileUpdateComponent implements OnInit {
  isSaving = false;
  personProfile: IPersonProfile | null = null;

  usersSharedCollection: IUser[] = [];
  eventsSharedCollection: IEvent[] = [];

  protected personProfileService = inject(PersonProfileService);
  protected personProfileFormService = inject(PersonProfileFormService);
  protected userService = inject(UserService);
  protected eventService = inject(EventService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: PersonProfileFormGroup = this.personProfileFormService.createPersonProfileFormGroup();

  compareUser = (o1: IUser | null, o2: IUser | null): boolean => this.userService.compareUser(o1, o2);

  compareEvent = (o1: IEvent | null, o2: IEvent | null): boolean => this.eventService.compareEvent(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ personProfile }) => {
      this.personProfile = personProfile;
      if (personProfile) {
        this.updateForm(personProfile);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const personProfile = this.personProfileFormService.getPersonProfile(this.editForm);
    if (personProfile.id !== null) {
      this.subscribeToSaveResponse(this.personProfileService.update(personProfile));
    } else {
      this.subscribeToSaveResponse(this.personProfileService.create(personProfile));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IPersonProfile>>): void {
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

  protected updateForm(personProfile: IPersonProfile): void {
    this.personProfile = personProfile;
    this.personProfileFormService.resetForm(this.editForm, personProfile);

    this.usersSharedCollection = this.userService.addUserToCollectionIfMissing<IUser>(
      this.usersSharedCollection,
      personProfile.internalUser,
    );
    this.eventsSharedCollection = this.eventService.addEventToCollectionIfMissing<IEvent>(
      this.eventsSharedCollection,
      ...(personProfile.events ?? []),
    );
  }

  protected loadRelationshipsOptions(): void {
    this.userService
      .query()
      .pipe(map((res: HttpResponse<IUser[]>) => res.body ?? []))
      .pipe(map((users: IUser[]) => this.userService.addUserToCollectionIfMissing<IUser>(users, this.personProfile?.internalUser)))
      .subscribe((users: IUser[]) => (this.usersSharedCollection = users));

    this.eventService
      .query()
      .pipe(map((res: HttpResponse<IEvent[]>) => res.body ?? []))
      .pipe(
        map((events: IEvent[]) => this.eventService.addEventToCollectionIfMissing<IEvent>(events, ...(this.personProfile?.events ?? []))),
      )
      .subscribe((events: IEvent[]) => (this.eventsSharedCollection = events));
  }
}
