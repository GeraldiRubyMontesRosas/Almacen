import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaginationInstance } from 'ngx-pagination';
import { NgxSpinnerService } from 'ngx-spinner';
import { MensajeService } from 'src/app/core/services/mensaje.service';
import { LoadingStates } from 'src/app/global/global';
import * as QRCode from 'qrcode-generator'; 
import { identifierName } from '@angular/compiler';


@Component({
  selector: 'app-inmuebles',
  templateUrl: './inmuebles.component.html',
  styleUrls: ['./inmuebles.component.css'],
})
export class InmueblesComponent {
  @ViewChild('searchItem') searchItem!: ElementRef;
  @ViewChild('closebutton') closebutton!: ElementRef;
  public isUpdatingfoto: boolean = false;

  inmueblesForm!: FormGroup;
  qrCodeBase64!: string;

  isLoading = LoadingStates.neutro;
  idUpdate!: number;
  isModalAdd = true;

  constructor(
    @Inject('CONFIG_PAGINATOR') public configPaginator: PaginationInstance,
    private spinnerService: NgxSpinnerService,
    private mensajeService: MensajeService,
    private formBuilder: FormBuilder
  ) {
    this.creteForm();
  }

  creteForm() {
    this.inmueblesForm = this.formBuilder.group({
      codigo: [null],
      nombre: [
        '',
        [
          Validators.maxLength(22),
          Validators.minLength(2),
          Validators.required,
        ],
      ],
      cantidad: ['', [Validators.maxLength(10), Validators.required]],
      descripcion: ['', [Validators.required]],
      imagenBase64: [''],
      areasDeResgualdo: ['', [Validators.required]],
    });
  }

  resetForm() {
    this.closebutton.nativeElement.click();
    this.inmueblesForm.reset();
  }
  onFileChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;

    if (inputElement.files && inputElement.files.length > 0) {
      const file = inputElement.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        const base64String = reader.result as string;
        const base64WithoutPrefix = base64String.split(';base64,').pop() || '';

        this.inmueblesForm.patchValue({
          imagenBase64: base64WithoutPrefix, // Contiene solo la representación en base64
        });
      };
      this.isUpdatingfoto = false;
      reader.readAsDataURL(file);
    }
  }

  async generarID() {
    const nombreControl = this.inmueblesForm.get('nombre');
    const areaRespaldoControl = this.inmueblesForm.get('areasDeResgualdo');

    if (nombreControl && areaRespaldoControl) {
      const nombre = nombreControl.value.toUpperCase();
      const areaRespaldo = areaRespaldoControl.value.toUpperCase();
      const letraAleatoria = String.fromCharCode(65 + Math.floor(Math.random() * 26)).toUpperCase();
      const numerosAleatorios = Array.from({ length: 3 }, () => Math.floor(Math.random() * 10)).join('');
      const idGenerado = `${nombre.slice(0, 3)}${areaRespaldo.slice(0, 3)}${letraAleatoria}${numerosAleatorios}`;
      
      const qr = QRCode(0, 'H'); 
      qr.addData(idGenerado); 
      qr.make(); 

      this.qrCodeBase64 = qr.createDataURL(4); 

      console.log(idGenerado);
      console.log(this.qrCodeBase64); 
    }
  }

}
