import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { IUserEvent, NewUserEvent } from '../user-event.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IUserEvent for edit and NewUserEventFormGroupInput for create.
 */
type UserEventFormGroupInput = IUserEvent | PartialWithRequiredKeyOf<NewUserEvent>;

type UserEventFormDefaults = Pick<NewUserEvent, 'id' | 'checkedIn' | 'matchCompleted'>;

type UserEventFormGroupContent = {
  id: FormControl<IUserEvent['id'] | NewUserEvent['id']>;
  status: FormControl<IUserEvent['status']>;
  checkedIn: FormControl<IUserEvent['checkedIn']>;
  matchCompleted: FormControl<IUserEvent['matchCompleted']>;
  paymentStatus: FormControl<IUserEvent['paymentStatus']>;
  personProfile: FormControl<IUserEvent['personProfile']>;
  event: FormControl<IUserEvent['event']>;
};

export type UserEventFormGroup = FormGroup<UserEventFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class UserEventFormService {
  createUserEventFormGroup(userEvent: UserEventFormGroupInput = { id: null }): UserEventFormGroup {
    const userEventRawValue = {
      ...this.getFormDefaults(),
      ...userEvent,
    };
    return new FormGroup<UserEventFormGroupContent>({
      id: new FormControl(
        { value: userEventRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      status: new FormControl(userEventRawValue.status),
      checkedIn: new FormControl(userEventRawValue.checkedIn),
      matchCompleted: new FormControl(userEventRawValue.matchCompleted),
      paymentStatus: new FormControl(userEventRawValue.paymentStatus, {
        validators: [Validators.required],
      }),
      personProfile: new FormControl(userEventRawValue.personProfile),
      event: new FormControl(userEventRawValue.event),
    });
  }

  getUserEvent(form: UserEventFormGroup): IUserEvent | NewUserEvent {
    return form.getRawValue() as IUserEvent | NewUserEvent;
  }

  resetForm(form: UserEventFormGroup, userEvent: UserEventFormGroupInput): void {
    const userEventRawValue = { ...this.getFormDefaults(), ...userEvent };
    form.reset(
      {
        ...userEventRawValue,
        id: { value: userEventRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): UserEventFormDefaults {
    return {
      id: null,
      checkedIn: false,
      matchCompleted: false,
    };
  }
}
