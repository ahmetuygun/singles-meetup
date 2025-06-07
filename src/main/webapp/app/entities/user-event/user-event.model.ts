import { IPersonProfile } from 'app/entities/person-profile/person-profile.model';
import { IEvent } from 'app/entities/event/event.model';
import { PaymentStatus } from 'app/entities/enumerations/payment-status.model';

export interface IUserEvent {
  id: number;
  status?: string | null;
  checkedIn?: boolean | null;
  matchCompleted?: boolean | null;
  paymentStatus?: keyof typeof PaymentStatus | null;
  personProfile?: IPersonProfile | null;
  event?: IEvent | null;
}

export type NewUserEvent = Omit<IUserEvent, 'id'> & { id: null };
