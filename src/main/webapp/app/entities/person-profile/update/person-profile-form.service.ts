import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { IPersonProfile, NewPersonProfile } from '../person-profile.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IPersonProfile for edit and NewPersonProfileFormGroupInput for create.
 */
type PersonProfileFormGroupInput = IPersonProfile | PartialWithRequiredKeyOf<NewPersonProfile>;

type PersonProfileFormDefaults = Pick<NewPersonProfile, 'id' | 'events'>;

type PersonProfileFormGroupContent = {
  id: FormControl<IPersonProfile['id'] | NewPersonProfile['id']>;
  firstName: FormControl<IPersonProfile['firstName']>;
  lastName: FormControl<IPersonProfile['lastName']>;
  dob: FormControl<IPersonProfile['dob']>;
  gender: FormControl<IPersonProfile['gender']>;
  bio: FormControl<IPersonProfile['bio']>;
  interests: FormControl<IPersonProfile['interests']>;
  location: FormControl<IPersonProfile['location']>;
  internalUser: FormControl<IPersonProfile['internalUser']>;
  events: FormControl<IPersonProfile['events']>;
};

export type PersonProfileFormGroup = FormGroup<PersonProfileFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class PersonProfileFormService {
  createPersonProfileFormGroup(personProfile: PersonProfileFormGroupInput = { id: null }): PersonProfileFormGroup {
    const personProfileRawValue = {
      ...this.getFormDefaults(),
      ...personProfile,
    };
    return new FormGroup<PersonProfileFormGroupContent>({
      id: new FormControl(
        { value: personProfileRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      firstName: new FormControl(personProfileRawValue.firstName, {
        validators: [Validators.required],
      }),
      lastName: new FormControl(personProfileRawValue.lastName, {
        validators: [Validators.required],
      }),
      dob: new FormControl(personProfileRawValue.dob, {
        validators: [Validators.required],
      }),
      gender: new FormControl(personProfileRawValue.gender, {
        validators: [Validators.required],
      }),
      bio: new FormControl(personProfileRawValue.bio),
      interests: new FormControl(personProfileRawValue.interests),
      location: new FormControl(personProfileRawValue.location),
      internalUser: new FormControl(personProfileRawValue.internalUser),
      events: new FormControl(personProfileRawValue.events ?? []),
    });
  }

  getPersonProfile(form: PersonProfileFormGroup): IPersonProfile | NewPersonProfile {
    return form.getRawValue() as IPersonProfile | NewPersonProfile;
  }

  resetForm(form: PersonProfileFormGroup, personProfile: PersonProfileFormGroupInput): void {
    const personProfileRawValue = { ...this.getFormDefaults(), ...personProfile };
    form.reset(
      {
        ...personProfileRawValue,
        id: { value: personProfileRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): PersonProfileFormDefaults {
    return {
      id: null,
      events: [],
    };
  }
}
