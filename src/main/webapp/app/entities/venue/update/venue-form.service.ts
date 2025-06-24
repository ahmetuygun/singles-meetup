import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { IVenue, NewVenue } from '../venue.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IVenue for edit and NewVenueFormGroupInput for create.
 */
type VenueFormGroupInput = IVenue | PartialWithRequiredKeyOf<NewVenue>;

type VenueFormDefaults = Pick<NewVenue, 'id'>;

type VenueFormGroupContent = {
  id: FormControl<IVenue['id'] | NewVenue['id']>;
  name: FormControl<IVenue['name']>;
  address: FormControl<IVenue['address']>;
  city: FormControl<IVenue['city']>;
  capacity: FormControl<IVenue['capacity']>;
  contactInfo: FormControl<IVenue['contactInfo']>;
  photoUrl: FormControl<IVenue['photoUrl']>;
  latitude: FormControl<IVenue['latitude']>;
  longitude: FormControl<IVenue['longitude']>;
};

export type VenueFormGroup = FormGroup<VenueFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class VenueFormService {
  createVenueFormGroup(venue: VenueFormGroupInput = { id: null }): VenueFormGroup {
    const venueRawValue = {
      ...this.getFormDefaults(),
      ...venue,
    };
    return new FormGroup<VenueFormGroupContent>({
      id: new FormControl(
        { value: venueRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      name: new FormControl(venueRawValue.name, {
        validators: [Validators.required],
      }),
      address: new FormControl(venueRawValue.address, {
        validators: [Validators.required],
      }),
      city: new FormControl(venueRawValue.city),
      capacity: new FormControl(venueRawValue.capacity),
      contactInfo: new FormControl(venueRawValue.contactInfo),
      photoUrl: new FormControl(venueRawValue.photoUrl),
      latitude: new FormControl(venueRawValue.latitude),
      longitude: new FormControl(venueRawValue.longitude),
    });
  }

  getVenue(form: VenueFormGroup): IVenue | NewVenue {
    return form.getRawValue() as IVenue | NewVenue;
  }

  resetForm(form: VenueFormGroup, venue: VenueFormGroupInput): void {
    const venueRawValue = { ...this.getFormDefaults(), ...venue };
    form.reset(
      {
        ...venueRawValue,
        id: { value: venueRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): VenueFormDefaults {
    return {
      id: null,
    };
  }
}
