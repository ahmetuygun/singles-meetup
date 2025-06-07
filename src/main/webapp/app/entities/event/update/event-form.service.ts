import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IEvent, NewEvent } from '../event.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IEvent for edit and NewEventFormGroupInput for create.
 */
type EventFormGroupInput = IEvent | PartialWithRequiredKeyOf<NewEvent>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IEvent | NewEvent> = Omit<T, 'eventDate'> & {
  eventDate?: string | null;
};

type EventFormRawValue = FormValueOf<IEvent>;

type NewEventFormRawValue = FormValueOf<NewEvent>;

type EventFormDefaults = Pick<NewEvent, 'id' | 'eventDate' | 'participants'>;

type EventFormGroupContent = {
  id: FormControl<EventFormRawValue['id'] | NewEvent['id']>;
  name: FormControl<EventFormRawValue['name']>;
  description: FormControl<EventFormRawValue['description']>;
  eventDate: FormControl<EventFormRawValue['eventDate']>;
  maxParticipants: FormControl<EventFormRawValue['maxParticipants']>;
  status: FormControl<EventFormRawValue['status']>;
  price: FormControl<EventFormRawValue['price']>;
  venue: FormControl<EventFormRawValue['venue']>;
  participants: FormControl<EventFormRawValue['participants']>;
};

export type EventFormGroup = FormGroup<EventFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class EventFormService {
  createEventFormGroup(event: EventFormGroupInput = { id: null }): EventFormGroup {
    const eventRawValue = this.convertEventToEventRawValue({
      ...this.getFormDefaults(),
      ...event,
    });
    return new FormGroup<EventFormGroupContent>({
      id: new FormControl(
        { value: eventRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      name: new FormControl(eventRawValue.name, {
        validators: [Validators.required],
      }),
      description: new FormControl(eventRawValue.description),
      eventDate: new FormControl(eventRawValue.eventDate, {
        validators: [Validators.required],
      }),
      maxParticipants: new FormControl(eventRawValue.maxParticipants),
      status: new FormControl(eventRawValue.status),
      price: new FormControl(eventRawValue.price, {
        validators: [Validators.required],
      }),
      venue: new FormControl(eventRawValue.venue),
      participants: new FormControl(eventRawValue.participants ?? []),
    });
  }

  getEvent(form: EventFormGroup): IEvent | NewEvent {
    return this.convertEventRawValueToEvent(form.getRawValue() as EventFormRawValue | NewEventFormRawValue);
  }

  resetForm(form: EventFormGroup, event: EventFormGroupInput): void {
    const eventRawValue = this.convertEventToEventRawValue({ ...this.getFormDefaults(), ...event });
    form.reset(
      {
        ...eventRawValue,
        id: { value: eventRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): EventFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      eventDate: currentTime,
      participants: [],
    };
  }

  private convertEventRawValueToEvent(rawEvent: EventFormRawValue | NewEventFormRawValue): IEvent | NewEvent {
    return {
      ...rawEvent,
      eventDate: dayjs(rawEvent.eventDate, DATE_TIME_FORMAT),
    };
  }

  private convertEventToEventRawValue(
    event: IEvent | (Partial<NewEvent> & EventFormDefaults),
  ): EventFormRawValue | PartialWithRequiredKeyOf<NewEventFormRawValue> {
    return {
      ...event,
      eventDate: event.eventDate ? event.eventDate.format(DATE_TIME_FORMAT) : undefined,
      participants: event.participants ?? [],
    };
  }
}
