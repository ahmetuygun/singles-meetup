import dayjs from 'dayjs/esm';
import { IPersonProfile } from '../person-profile/person-profile.model';
import { ITicket } from '../ticket/ticket.model';
import { IEvent } from '../event/event.model';
import { PaymentStatus } from '../enumerations/payment-status.model';

export interface IUserTicket {
  id: number;
  quantity?: number | null;
  totalPrice?: number | null;
  bookingFee?: number | null;
  paymentStatus?: keyof typeof PaymentStatus | null;
  paymentMethod?: string | null;
  purchaseDate?: dayjs.Dayjs | null;
  ticketCode?: string | null;
  used?: boolean | null;
  personProfile?: Pick<IPersonProfile, 'id'> | null;
  ticket?: Pick<ITicket, 'id' | 'name' | 'price'> & { event?: Pick<IEvent, 'id' | 'name'> | null } | null;
}

export type NewUserTicket = Omit<IUserTicket, 'id'> & { id: null }; 