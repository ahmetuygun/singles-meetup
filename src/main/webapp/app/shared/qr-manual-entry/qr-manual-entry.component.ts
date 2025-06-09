import { Component, EventEmitter, Input, Output, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import SharedModule from 'app/shared/shared.module';

@Component({
  selector: 'jhi-qr-manual-entry',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule],
  template: `
    <div class="qr-manual-modal">
      <div class="modal-overlay" (click)="close()"></div>
      <div class="manual-container">
        <div class="manual-header">
          <h4 class="mb-0">Manual QR Code Entry</h4>
          <button type="button" class="btn-close" (click)="close()">
            <fa-icon icon="times"></fa-icon>
          </button>
        </div>
        
        <div class="manual-body">
          <div class="mb-3">
            <label for="qrCodeInput" class="form-label">
              <fa-icon icon="qrcode" class="me-2"></fa-icon>
              QR Code Data
            </label>
            <textarea 
              #qrCodeInput
              id="qrCodeInput"
              class="form-control"
              rows="4"
              placeholder="Paste or type the QR code data here..."
              [(ngModel)]="qrCodeData"
              (keyup.enter)="validateCode()"
            ></textarea>
            <div class="form-text">
              <fa-icon icon="info-circle" class="me-1"></fa-icon>
              The QR code should contain ticket validation data
            </div>
          </div>

          @if (validationError) {
            <div class="alert alert-danger">
              <fa-icon icon="exclamation-triangle" class="me-2"></fa-icon>
              {{ validationError }}
            </div>
          }

          <div class="examples-section">
            <h6 class="text-muted mb-2">
              <fa-icon icon="lightbulb" class="me-2"></fa-icon>
              Expected Format
            </h6>
            <div class="example-format">
              <code>TICKET:xxxxxxxx:EVENT:123:USER:456</code>
            </div>
            <small class="text-muted">
              Where xxxxxxxx is the ticket code, 123 is the event ID, and 456 is the user ID
            </small>
          </div>
        </div>
        
        <div class="manual-footer">
          <button 
            type="button" 
            class="btn btn-secondary me-2" 
            (click)="close()"
          >
            <fa-icon icon="times" class="me-2"></fa-icon>
            Cancel
          </button>
          <button 
            type="button" 
            class="btn btn-warning" 
            (click)="validateCode()"
            [disabled]="!qrCodeData.trim() || isValidating"
          >
            @if (isValidating) {
              <div class="spinner-border spinner-border-sm me-2" role="status"></div>
              Validating...
            } @else {
              <fa-icon icon="check" class="me-2"></fa-icon>
              Validate Code
            }
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .qr-manual-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1050;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .modal-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
    }
    
    .manual-container {
      position: relative;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      max-width: 500px;
      width: 90%;
      max-height: 80vh;
    }
    
    .manual-header {
      padding: 20px;
      border-bottom: 1px solid #dee2e6;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f8f9fa;
    }
    
    .btn-close {
      background: none;
      border: none;
      font-size: 1.2rem;
      color: #6c757d;
      cursor: pointer;
    }
    
    .btn-close:hover {
      color: #dc3545;
    }
    
    .manual-body {
      padding: 25px;
    }
    
    .form-control {
      font-family: 'Courier New', monospace;
      font-size: 14px;
    }
    
    .examples-section {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 15px;
      margin-top: 20px;
    }
    
    .example-format {
      background: white;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      padding: 10px;
      margin: 10px 0;
      font-family: 'Courier New', monospace;
      font-size: 13px;
      word-break: break-all;
    }
    
    .manual-footer {
      padding: 20px;
      border-top: 1px solid #dee2e6;
      display: flex;
      justify-content: flex-end;
      background: #f8f9fa;
    }
    
    .alert {
      margin: 15px 0;
    }
    
    .form-text {
      margin-top: 8px;
    }
  `]
})
export class QrManualEntryComponent implements AfterViewInit {
  @ViewChild('qrCodeInput') qrCodeInput!: ElementRef<HTMLTextAreaElement>;
  @Input() isOpen = false;
  @Output() onValidate = new EventEmitter<string>();
  @Output() onClose = new EventEmitter<void>();

  qrCodeData = '';
  validationError = '';
  isValidating = false;

  ngAfterViewInit() {
    if (this.isOpen) {
      // Focus the input field when modal opens
      setTimeout(() => {
        this.qrCodeInput?.nativeElement.focus();
      }, 100);
    }
  }

  validateCode() {
    if (!this.qrCodeData?.trim()) {
      this.validationError = 'Please enter QR code data';
      return;
    }

    // Basic format validation
    const qrData = this.qrCodeData.trim();
    const parts = qrData.split(':');
    
    if (parts.length !== 6 || parts[0] !== 'TICKET' || parts[2] !== 'EVENT' || parts[4] !== 'USER') {
      this.validationError = 'Invalid QR code format. Please check the format example below.';
      return;
    }

    // Check if event ID and user ID are valid numbers
    const eventId = parseInt(parts[3]);
    const userId = parseInt(parts[5]);
    
    if (isNaN(eventId) || isNaN(userId)) {
      this.validationError = 'Invalid event ID or user ID in QR code data.';
      return;
    }

    this.validationError = '';
    this.isValidating = true;
    
    // Emit the validated QR code data
    this.onValidate.emit(qrData);
  }

  close() {
    this.qrCodeData = '';
    this.validationError = '';
    this.isValidating = false;
    this.onClose.emit();
  }

  // Called from parent when validation is complete
  onValidationComplete() {
    this.isValidating = false;
  }
} 