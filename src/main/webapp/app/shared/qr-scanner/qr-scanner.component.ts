import { Component, EventEmitter, Input, Output, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';
import SharedModule from 'app/shared/shared.module';

@Component({
  selector: 'jhi-qr-scanner',
  standalone: true,
  imports: [CommonModule, SharedModule],
  template: `
    <div class="qr-scanner-modal">
      <div class="modal-overlay" (click)="close()"></div>
      <div class="scanner-container">
        <div class="scanner-header">
          <h4 class="mb-0">Scan QR Code</h4>
          <button type="button" class="btn-close" (click)="close()">
            <fa-icon icon="times"></fa-icon>
          </button>
        </div>
        
        <div class="scanner-body">
          @if (cameraError) {
            <div class="alert alert-danger text-center">
              <fa-icon icon="exclamation-triangle" class="me-2"></fa-icon>
              {{ cameraError }}
              <br><br>
              <small>Please ensure camera permissions are granted and try again.</small>
            </div>
          } @else {
            <div class="camera-container">
              <video #videoElement class="scanner-video" autoplay muted playsinline></video>
              <div class="scanner-overlay">
                <div class="scanner-frame"></div>
              </div>
            </div>
          }
          
          @if (scanning) {
            <div class="scanning-indicator">
              <div class="spinner-border spinner-border-sm me-2" role="status"></div>
              <span>Scanning for QR code...</span>
            </div>
          }
        </div>
        
        <div class="scanner-footer">
          <button type="button" class="btn btn-secondary me-2" (click)="close()">
            Cancel
          </button>
          <button type="button" class="btn btn-warning" (click)="switchCamera()" [disabled]="!hasMultipleCameras">
            <fa-icon icon="sync" class="me-2"></fa-icon>
            Switch Camera
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .qr-scanner-modal {
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
    
    .scanner-container {
      position: relative;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      max-width: 400px;
      width: 90%;
      max-height: 80vh;
    }
    
    .scanner-header {
      padding: 20px;
      border-bottom: 1px solid #dee2e6;
      display: flex;
      justify-content: between;
      align-items: center;
    }
    
    .btn-close {
      background: none;
      border: none;
      font-size: 1.2rem;
      color: #6c757d;
      cursor: pointer;
      margin-left: auto;
    }
    
    .btn-close:hover {
      color: #dc3545;
    }
    
    .scanner-body {
      padding: 20px;
    }
    
    .camera-container {
      position: relative;
      background: #000;
      border-radius: 8px;
      overflow: hidden;
      aspect-ratio: 1;
    }
    
    .scanner-video {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .scanner-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .scanner-frame {
      width: 60%;
      height: 60%;
      border: 3px solid #ffc107;
      border-radius: 12px;
      box-shadow: 0 0 0 99999px rgba(0, 0, 0, 0.5);
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0% { border-color: #ffc107; }
      50% { border-color: #fff; }
      100% { border-color: #ffc107; }
    }
    
    .scanning-indicator {
      text-align: center;
      margin-top: 15px;
      color: #6c757d;
      font-size: 14px;
    }
    
    .scanner-footer {
      padding: 20px;
      border-top: 1px solid #dee2e6;
      display: flex;
      justify-content: space-between;
    }
    
    .alert {
      margin: 0;
    }
  `]
})
export class QrScannerComponent implements AfterViewInit, OnDestroy {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @Input() isOpen = false;
  @Output() onScan = new EventEmitter<string>();
  @Output() onClose = new EventEmitter<void>();

  private codeReader = new BrowserMultiFormatReader();
  private stream: MediaStream | null = null;
  private currentDeviceId: string | null = null;
  private availableDevices: MediaDeviceInfo[] = [];

  scanning = false;
  cameraError: string | null = null;
  hasMultipleCameras = false;

  async ngAfterViewInit() {
    if (this.isOpen) {
      await this.startScanning();
    }
  }

  ngOnDestroy() {
    this.stopScanning();
  }

  async startScanning() {
    try {
      this.scanning = true;
      this.cameraError = null;

      // Get available video devices
      this.availableDevices = await this.codeReader.listVideoInputDevices();
      this.hasMultipleCameras = this.availableDevices.length > 1;

      // Use back camera if available (mobile devices)
      const backCamera = this.availableDevices.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('rear') ||
        device.label.toLowerCase().includes('environment')
      );
      
      this.currentDeviceId = backCamera?.deviceId || this.availableDevices[0]?.deviceId || null;

      if (!this.currentDeviceId) {
        throw new Error('No camera devices found');
      }

      // Start decoding
      await this.codeReader.decodeFromVideoDevice(
        this.currentDeviceId,
        this.videoElement.nativeElement,
        (result, err) => {
          if (result) {
            const qrData = result.getText();
            this.onScan.emit(qrData);
            this.close();
          }
          if (err && !(err instanceof NotFoundException)) {
            console.error('QR scanning error:', err);
          }
        }
      );

      this.scanning = false;
    } catch (error) {
      console.error('Error starting QR scanner:', error);
      this.cameraError = 'Unable to access camera. Please check permissions and try again.';
      this.scanning = false;
    }
  }

  async switchCamera() {
    if (this.availableDevices.length <= 1) return;

    const currentIndex = this.availableDevices.findIndex(d => d.deviceId === this.currentDeviceId);
    const nextIndex = (currentIndex + 1) % this.availableDevices.length;
    this.currentDeviceId = this.availableDevices[nextIndex].deviceId;

    this.stopScanning();
    await this.startScanning();
  }

  stopScanning() {
    this.codeReader.reset();
    this.scanning = false;
  }

  close() {
    this.stopScanning();
    this.onClose.emit();
  }
} 