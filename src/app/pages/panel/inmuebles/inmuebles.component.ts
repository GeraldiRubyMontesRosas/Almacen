import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaginationInstance } from 'ngx-pagination';
import { NgxSpinnerService } from 'ngx-spinner';
import { MensajeService } from 'src/app/core/services/mensaje.service';
import { LoadingStates } from 'src/app/global/global';

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
      id: [null],
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
}
