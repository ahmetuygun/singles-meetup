import { Component, inject, input, ViewChild } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { filter } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

import SharedModule from 'app/shared/shared.module';
import { FormatMediumDatetimePipe } from 'app/shared/date';
import { DataUtils } from 'app/core/util/data-util.service';
import { AccountService } from 'app/core/auth/account.service';
import { IEvent } from '../event.model';
import HasAnyAuthorityDirective from "../../../shared/auth/has-any-authority.directive";
import { EventDeleteDialogComponent } from '../delete/event-delete-dialog.component';
import { QrScannerComponent } from '../../../shared/qr-scanner/qr-scanner.component';
import { QrManualEntryComponent } from '../../../shared/qr-manual-entry/qr-manual-entry.component';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';

@Component({
  selector: 'jhi-event-detail',
  templateUrl: './event-detail.component.html',
  imports: [SharedModule, RouterModule, FormatMediumDatetimePipe, HasAnyAuthorityDirective, QrScannerComponent, QrManualEntryComponent],
})
export class EventDetailComponent {
  @ViewChild(QrManualEntryComponent) manualEntryComponent!: QrManualEntryComponent;
  
  event = input<IEvent | null>(null);

  protected dataUtils = inject(DataUtils);
  protected modalService = inject(NgbModal);
  protected router = inject(Router);
  protected accountService = inject(AccountService);
  protected http = inject(HttpClient);
  
  showQrScanner = false;
  showManualEntry = false;

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
    return eventDate.format('D MMM, HH.mm');
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

  navigateToVenue(venueId: number | undefined): void {
    if (venueId) {
      this.router.navigate(['/venue', venueId, 'view']);
    }
  }

  validateQrCode(): void {
    this.showQrScanner = true;
  }

  onQrCodeScanned(qrData: string): void {
    this.showQrScanner = false;
    this.processQrCode(qrData);
  }

  onScannerClosed(): void {
    this.showQrScanner = false;
  }

  manualQrEntry(): void {
    this.showManualEntry = true;
  }

  onManualValidate(qrData: string): void {
    this.showManualEntry = false;
    this.processQrCode(qrData);
  }

  onManualEntryClosed(): void {
    this.showManualEntry = false;
  }

  private processQrCode(qrData: string): void {
    this.http.post<any>('/api/user-events/validate-qr', { qrData }).subscribe({
      next: (response) => {
        // Notify manual entry component that validation is complete
        if (this.manualEntryComponent) {
          this.manualEntryComponent.onValidationComplete();
        }
        
        if (response.valid) {
          alert(`✅ Check-in successful!\n\nUser: ${response.userEvent?.personProfile?.firstName} ${response.userEvent?.personProfile?.lastName}`);
        } else {
          alert(`❌ ${response.message}`);
        }
      },
      error: (error) => {
        // Notify manual entry component that validation is complete
        if (this.manualEntryComponent) {
          this.manualEntryComponent.onValidationComplete();
        }
        
        alert('Error validating QR code. Please try again.');
      }
    });
  }
}
