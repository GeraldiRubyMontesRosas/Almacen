import { Component, ElementRef, ViewChild,OnInit } from '@angular/core';
import { FormBuilder, FormGroup} from '@angular/forms';
import { InmueblesService } from 'src/app/core/services/inmueble.service';
import { Inmueble } from 'src/app/models/inmueble';

@Component({
  selector: 'app-scanner',
  templateUrl: './scanner.component.html',
  styleUrls: ['./scanner.component.css'],
})
export class ScannerComponent {
  @ViewChild('previewVideo') previewVideo!: ElementRef<HTMLVideoElement>;
  cameraActive: boolean = false;
  mediaStream: MediaStream | null = null;
  
  inmueble !: Inmueble;
  inmuebles : Inmueble[] = [];
  inmueblesForm !: FormGroup;
  inmueblesFilter: Inmueble[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private inmueblesService: InmueblesService 
  ) {}

  toggleCamera() {
    this.cameraActive = !this.cameraActive;
  }

  handleScanSuccess(result: string) {
    console.log('Scan result:', result);
  }
}
