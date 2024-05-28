import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-scanner',
  templateUrl: './scanner.component.html',
  styleUrls: ['./scanner.component.css'],
})
export class ScannerComponent {
  @ViewChild('previewVideo') previewVideo!: ElementRef<HTMLVideoElement>;
  cameraActive: boolean = false;
  mediaStream: MediaStream | null = null;

  constructor() {}

  ngAfterViewInit() {
    this.startPreview();
  }

  onCodeResult(resultString: string) {
    console.log(resultString);
    this.searchInDatabase(resultString);
  }

  searchInDatabase(qrCode: string) {
    // Implementa la llamada a tu API aquí
  }

  toggleCamera() {
    if (this.cameraActive) {
      this.stopPreview();
    } else {
      this.startPreview();
    }
    this.cameraActive = !this.cameraActive;
  }

  private startPreview() {
    const videoElement = this.previewVideo.nativeElement;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' } })
      .then((stream) => {
        videoElement.srcObject = stream;
        videoElement.play();
        this.mediaStream = stream; // Guardar la referencia al stream
      })
      .catch((err) => console.error('Error al acceder a la cámara: ', err));
  }

  private stopPreview() {
    if (this.mediaStream) {
      const tracks = this.mediaStream.getTracks();
      tracks.forEach((track) => track.stop());
    }
  }
}
