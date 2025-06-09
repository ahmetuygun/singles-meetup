import { Component, inject, input } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { filter } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormatMediumDatetimePipe } from 'app/shared/date';
import { DataUtils } from 'app/core/util/data-util.service';
import { AccountService } from 'app/core/auth/account.service';
import { IEvent } from '../event.model';
import HasAnyAuthorityDirective from "../../../shared/auth/has-any-authority.directive";
import { EventDeleteDialogComponent } from '../delete/event-delete-dialog.component';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';

@Component({
  selector: 'jhi-event-detail',
  templateUrl: './event-detail.component.html',
  imports: [SharedModule, RouterModule, FormatMediumDatetimePipe, HasAnyAuthorityDirective],
})
export class EventDetailComponent {
  event = input<IEvent | null>(null);

  protected dataUtils = inject(DataUtils);
  protected modalService = inject(NgbModal);
  protected router = inject(Router);
  protected accountService = inject(AccountService);

  byteSize(base64String: string): string {
    return this.dataUtils.byteSize(base64String);
  }

  openFile(base64String: string, contentType: string | null | undefined): void {
    this.dataUtils.openFile(base64String, contentType);
  }

  previousState(): void {
    window.history.back();
  }

  delete(event: IEvent): void {
    const modalRef = this.modalService.open(EventDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.event = event;
    modalRef.closed
      .pipe(filter(reason => reason === ITEM_DELETED_EVENT))
      .subscribe(() => {
        this.router.navigate(['/']);
      });
  }

  formatEventDate(eventDate: any): string {
    if (!eventDate) return '';
    return eventDate.format('dddd, MMMM D, YYYY [at] HH:mm');
  }

  openTicketPurchase(): void {
    const eventId = this.event()?.id;
    if (eventId) {
      this.router.navigate(['/event', eventId, 'tickets']);
    }
  }

  viewEventJoiners(): void {
    const eventId = this.event()?.id;
    if (eventId) {
      this.router.navigate(['/event', eventId, 'joiners']);
    }
  }
}
