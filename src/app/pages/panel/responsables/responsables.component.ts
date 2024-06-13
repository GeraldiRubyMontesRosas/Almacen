import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaginationInstance } from 'ngx-pagination';
import { NgxSpinnerService } from 'ngx-spinner';
import { MensajeService } from 'src/app/core/services/mensaje.service';
import { LoadingStates } from 'src/app/global/global';


import { ResponsableService } from 'src/app/core/services/responsable.service';
import { Responsable } from 'src/app/models/Responsable';

import * as XLSX from 'xlsx';

@Component({
  selector: 'app-responsables',
  templateUrl: './responsables.component.html',
  styleUrls: ['./responsables.component.css'],
})
export class ResponsablesComponent {
  @ViewChild('searchItem') searchItem!: ElementRef;
  @ViewChild('closebutton') closebutton!: ElementRef;

  responsable!: Responsable;
  responsables: Responsable[] = [];
  responsablesForm!: FormGroup;
  responsablesFilter: Responsable[] = [];

  isLoading = LoadingStates.neutro;
  idUpdate!: number;
  isModalAdd = true;

  constructor(
    @Inject('CONFIG_PAGINATOR') public configPaginator: PaginationInstance,
    private spinnerService: NgxSpinnerService,
    private mensajeService: MensajeService,
    private formBuilder: FormBuilder,
    private responsableService: ResponsableService
  ) {
    this.responsableService.refreshListResponsable.subscribe(() =>
      this.getResponsables()
    );
    this.getResponsables();
    this.creteForm();
  }

  creteForm() {
    this.responsablesForm = this.formBuilder.group({
      id: [null],
      nombres: [
        '',
        [
          Validators.maxLength(22),
          Validators.minLength(2),
          Validators.required,
        ],
      ],
      apellidoPaterno: [
        '',
        [
          Validators.maxLength(22),
          Validators.minLength(2),
          Validators.required,
        ],
      ],
      apellidoMaterno: [
        '',
        [
          Validators.maxLength(22),
          Validators.minLength(2),
          Validators.required,
        ],
      ],
      fechaDeNacimiento: [[Validators.required]],
      estatus: [true],
    });
  }

  getResponsables() {
    this.isLoading = LoadingStates.trueLoading;
    this.responsableService.getAll().subscribe({
      next: (dataFromAPI) => {
        this.responsables = dataFromAPI;
        this.responsablesFilter = this.responsables;
        this.isLoading = LoadingStates.falseLoading;
      },
      error: () => {
        this.isLoading = LoadingStates.errorLoading;
      },
    });
  }

  setDataModalUpdate(dto: Responsable) {
    this.isModalAdd = false;
    this.idUpdate = dto.id;
    this.responsablesForm.patchValue({
      id: dto.id,
      nombres: dto.nombres,
    });
  }

  resetForm() {
    this.closebutton.nativeElement.click();
    this.responsablesForm.reset();
  }

  editarUsuario() {
    this.responsable = this.responsablesForm.value as Responsable;
    this.handleFechaDeNacimiento();
    this.handleNombreCompleto();
    this.responsableService.put(this.idUpdate, this.responsable).subscribe({
      next: () => {
        this.spinnerService.hide();
        this.mensajeService.mensajeExito(
          'Responsable actualizada correctamente'
        );
        this.resetForm();
      },
      error: (error) => {
        this.spinnerService.hide();
        this.mensajeService.mensajeError(error);
      },
    });
  }

  agregar() {
    this.responsable = this.responsablesForm.value as Responsable;
    this.handleFechaDeNacimiento();
    this.handleNombreCompleto();
    this.spinnerService.show();
    this.responsableService.post(this.responsable).subscribe({
      next: () => {
        this.spinnerService.hide();
        this.mensajeService.mensajeExito('Responsable guardada correctamente');
        this.resetForm();
        this.configPaginator.currentPage = 1;
      },
      error: (error) => {
        this.spinnerService.hide();
        this.mensajeService.mensajeError(error);
      },
    });
  }

  submit() {
    if (this.isModalAdd === false) {
      this.editarUsuario();
    } else {
      this.agregar();
    }
  }

  deleteItem(id: number, nameItem: string) {
    this.mensajeService.mensajeAdvertencia(
      `¿Estás seguro de eliminar la responsable: ${nameItem}?`,
      () => {
        this.responsableService.delete(id).subscribe({
          next: () => {
            this.mensajeService.mensajeExito(
              'Responsable borrada correctamente'
            );
            this.configPaginator.currentPage = 1;
            this.searchItem.nativeElement.value = '';
          },
          error: (error) => this.mensajeService.mensajeError(error),
        });
      }
    );
  }

  handleChangeAdd() {
    if (this.responsablesForm) {
      this.responsablesForm.reset();
      this.isModalAdd = true;
    }
  }

  handleChangeSearch(event: any) {
    const inputValue = event.target.value;
    const valueSearch = inputValue.toLowerCase();

    this.responsablesFilter = this.responsables.filter((responsable) =>
      responsable.nombreCompleto.toLowerCase().includes(valueSearch)
    );

    this.configPaginator.currentPage = 1;
  }

  onPageChange(number: number) {
    this.configPaginator.currentPage = number;
  }

  guardarArchivoExcel(buffer: any, nombreArchivo: string) {
    const data: Blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url: string = window.URL.createObjectURL(data);
    const a: HTMLAnchorElement = document.createElement('a');
    a.href = url;
    a.download = nombreArchivo;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  exportarDatosAExcel() {
    if (this.responsables.length === 0) {
      console.warn('La lista de a. No se puede exportar.');
      return;
    }

    const datosParaExportar = this.responsables.map((responsables) => {
      return {
        '#': responsables.id,
        Nombre: responsables.nombres,
        ApellidoMaterno: responsables.apellidoMaterno,
        ApellidoPaterno: responsables.apellidoPaterno,
        FechaDeNacimiento: responsables.strFechaNacimiento,
        Edad: responsables.edad,
      };
    });

    const worksheet: XLSX.WorkSheet =
      XLSX.utils.json_to_sheet(datosParaExportar);
    const workbook: XLSX.WorkBook = {
      Sheets: { data: worksheet },
      SheetNames: ['data'],
    };
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    this.guardarArchivoExcel(excelBuffer, 'Responsables.xlsx');
  }

  calculateAge(birthDate: Date): number {
    const today = new Date();
    const birthYear = birthDate.getFullYear();
    const birthMonth = birthDate.getMonth();
    const birthDay = birthDate.getDate();

    let age = today.getFullYear() - birthYear;
    const monthDifference = today.getMonth() - birthMonth;
    const dayDifference = today.getDate() - birthDay;

    if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
      age--;
    }

    return age;
  }

  getControlValue = (controlName: string) => {
    const control = this.responsablesForm.get(controlName);
    return control ? control.value : null;
  };
  
  handleFechaDeNacimiento = () => {
    const fechaDeNacimientoValue = this.getControlValue('fechaDeNacimiento');
    if (fechaDeNacimientoValue) {
      const fechaDeNacimiento: Date = new Date(fechaDeNacimientoValue);
      this.responsable.edad = this.calculateAge(fechaDeNacimiento);
      this.responsable.strFechaNacimiento = fechaDeNacimiento.toISOString();
    } else {
      console.error('No se pudo obtener la fecha de nacimiento del formulario.');
    }
  };
  
  handleNombreCompleto = () => {
    const nombresValue = this.getControlValue('nombres');
    const apellidoPaternoValue = this.getControlValue('apellidoPaterno');
    const apellidoMaternoValue = this.getControlValue('apellidoMaterno');
  
    if (nombresValue && apellidoPaternoValue && apellidoMaternoValue) {
      this.responsable.nombreCompleto = `${nombresValue} ${apellidoPaternoValue} ${apellidoMaternoValue}`;
    } else {
      console.error('No se pudo obtener alguno de los valores necesarios para el nombre completo.');
      this.mensajeService.mensajeError('No se pudo obtener alguno de los valores necesarios para el nombre completo.');
    }
  };
  
}
