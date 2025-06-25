import { Component, inject, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import SharedModule from 'app/shared/shared.module';

@Component({
  selector: 'jhi-qr-code-modal',
  standalone: true,
  imports: [CommonModule, SharedModule],
  template: `
    <div class="modal-header">
      <h4 class="modal-title">
        <fa-icon icon="qrcode" class="me-2"></fa-icon>
        Entry QR Code
      </h4>
      <button type="button" class="btn-close" aria-label="Close" (click)="dismiss()">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>

    <div class="modal-body text-center p-4">
      <div class="mb-3">
        <h5 class="text-dark mb-2">{{ eventName }}</h5>
        <small class="text-muted">Present this QR code at the event entrance</small>
      </div>
      
      <div class="qr-code-container mb-3">
        <div class="qr-code-wrapper">
          <img [src]="qrCode" alt="QR Code" class="qr-code-image" />
        </div>
      </div>
      
      <div class="ticket-info">
        <div class="ticket-code-badge">
          <small class="text-muted d-block">Ticket Code</small>
          <span class="fw-bold font-monospace text-primary">{{ ticketCode }}</span>
        </div>
      </div>
      
      <div class="mt-3">
        <small class="text-muted">
          <fa-icon icon="info-circle" class="me-1"></fa-icon>
          Keep this QR code ready when you arrive at the event
        </small>
      </div>
    </div>

    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" (click)="dismiss()">
        <fa-icon icon="times" class="me-2"></fa-icon>
        Close
      </button>
    </div>
  `,
  styles: [`
    .qr-code-container {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }
    
    .qr-code-wrapper {
      background: white;
      border: 2px solid #dee2e6;
      border-radius: 12px;
      padding: 15px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      display: inline-block;
    }
    
    .qr-code-image {
      width: 250px;
      height: 250px;
      display: block;
      border-radius: 8px;
    }
    
    .ticket-info {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 15px;
      margin: 0 auto;
      max-width: 300px;
    }
    
    .ticket-code-badge {
      text-align: center;
    }
    
    .modal-body {
      min-height: 400px;
    }
    
    .btn-close {
      background: none;
      border: none;
      font-size: 1.2rem;
      opacity: 0.5;
    }
    
    .btn-close:hover {
      opacity: 1;
    }
  `]
})
export class QrCodeModalComponent {
  @Input() qrCode?: string;
  @Input() eventName?: string;
  @Input() ticketCode?: string;

  protected activeModal = inject(NgbActiveModal);

  dismiss(): void {
    this.activeModal.dismiss();
  }
} 