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
      fechaNacimiento: [[Validators.required]],
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
  formatoFecha(fecha: string): string {
    // Aquí puedes utilizar la lógica para formatear la fecha según tus necesidades
    const fechaFormateada = new Date(fecha).toISOString().split('T')[0];
    return fechaFormateada;
  }
  setDataModalUpdate(dto: Responsable) {
    this.isModalAdd = false;
    this.idUpdate = dto.id;
    const fechaFormateada = this.formatoFecha(dto.fechaNacimiento);
    this.responsablesForm.patchValue({
      id: dto.id,
      nombres: dto.nombres,
      apellidoPaterno: dto.apellidoPaterno,
      apellidoMaterno: dto.apellidoMaterno,
      fechaNacimiento: fechaFormateada,
      estatus: dto.estatus,
    });
  }

  resetForm() {
    this.closebutton.nativeElement.click();
    this.responsablesForm.reset();
  }

  editarUsuario() {
    this.responsable = this.responsablesForm.value as Responsable;
    this.responsableService.put(this.idUpdate, this.responsable).subscribe({
      next: () => {
        this.spinnerService.hide();
        this.mensajeService.mensajeExito(
          'Responsable actualizado correctamente'
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
    this.spinnerService.show();
    this.responsableService.post(this.responsable).subscribe({
      next: () => {
        this.spinnerService.hide();
        this.mensajeService.mensajeExito('Responsable guardado correctamente');
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
              'Responsable borrado correctamente'
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
      const estatusControl = this.responsablesForm.get('estatus');
      if (estatusControl) {
        estatusControl.setValue(true);
      }
      this.isModalAdd = true;
    }
  }

  handleChangeSearch(event: any) {
    const inputValue = event.target.value;
    const valueSearch = inputValue.toLowerCase();

    this.responsablesFilter = this.responsables.filter(
      (responsable) =>
        responsable.nombreCompleto.toLowerCase().includes(valueSearch) ||
        responsable.edad.toString().includes(valueSearch)
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
      const estatus = responsables.estatus ? 'Activo' : 'Inactivo';
      const fechaFormateada = new Date(responsables.fechaNacimiento)
        .toISOString()
        .split('T')[0];
      return {
        '#': responsables.id,
        Nombre: responsables.nombres,
        ApellidoPaterno: responsables.apellidoPaterno,
        ApellidoMaterno: responsables.apellidoMaterno,
        'Fecha de nacimiento': fechaFormateada,
        Edad: responsables.edad,
        Estatus: estatus,
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
}
