import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaginationInstance } from 'ngx-pagination';
import { NgxSpinnerService } from 'ngx-spinner';
import { MensajeService } from 'src/app/core/services/mensaje.service';
import { TallasService } from 'src/app/core/services/tallas.service';
import { LoadingStates } from 'src/app/global/global';
import { Tallas } from 'src/app/models/tallas';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-tamanos',
  templateUrl: './tamanos.component.html',
  styleUrls: ['./tamanos.component.css'],
})
export class TamanosComponent {
  @ViewChild('searchItem') searchItem!: ElementRef;
  @ViewChild('closebutton') closebutton!: ElementRef;

  talla!: Tallas;
  tallas: Tallas[] = [];
  tallasForm!: FormGroup;
  tallasFilter: Tallas[] = [];
  isLoading = LoadingStates.neutro;
  idUpdate!: number;
  isModalAdd = true;

  constructor(
    @Inject('CONFIG_PAGINATOR') public configPaginator: PaginationInstance,
    private spinnerService: NgxSpinnerService,
    private mensajeService: MensajeService,
    private formBuilder: FormBuilder,
    private tallasService: TallasService
  ) {
    this.tallasService.refreshListTallas.subscribe(() => this.getTallas());
    this.getTallas();
    this.creteForm();
  }
  getTallas() {
    this.isLoading = LoadingStates.trueLoading;
    this.tallasService.getAll().subscribe({
      next: (dataFromAPI) => {
        this.tallas = dataFromAPI;
        this.tallasFilter = this.tallas;
        this.isLoading = LoadingStates.falseLoading;
      },
      error: () => {
        this.isLoading = LoadingStates.errorLoading;
      },
    });
  }

  creteForm() {
    this.tallasForm = this.formBuilder.group({
      id: [null],
      nombre: [
        '',
        [
          Validators.maxLength(22),
          Validators.minLength(2),
          Validators.required,
      ]
    ]
    });
  }

  setDataModalUpdate(dto: Tallas) {
    this.isModalAdd = false;
    this.idUpdate = dto.id;
    this.tallasForm.patchValue({
      id: dto.id,
      nombre: dto.nombre,
    });
  }

  editarUsuario() {
    this.talla = this.tallasForm.value as Tallas;
    this.spinnerService.show();
    this.tallasService.put(this.idUpdate, this.talla).subscribe({
      next: () => {
        this.spinnerService.hide();
        this.mensajeService.mensajeExito('Talla actualizada correctamente');
        this.resetForm();
      },
      error: (error) => {
        this.spinnerService.hide();
        this.mensajeService.mensajeError(error);
      },
    });
  }
  deleteItem(id: number, nameItem: string) {
    this.mensajeService.mensajeAdvertencia(
      `¿Estás seguro de eliminar la talla: ${nameItem}?`,
      () => {
        this.tallasService.delete(id).subscribe({
          next: () => {
            this.mensajeService.mensajeExito('Talla borrada correctamente');
            this.configPaginator.currentPage = 1;
            this.searchItem.nativeElement.value = '';
          },
          error: (error) => this.mensajeService.mensajeError(error),
        });
      }
    );
  }
  agregar() {
    this.talla = this.tallasForm.value as Tallas;
    this.spinnerService.show();
    this.tallasService.post(this.talla).subscribe({
      next: () => {
        this.spinnerService.hide();
        this.mensajeService.mensajeExito('Talla guardada correctamente');
        this.resetForm();
        this.configPaginator.currentPage = 1;
      },
      error: (error) => {
        this.spinnerService.hide();
        this.mensajeService.mensajeError(error);
      },
    });
  }

  resetForm() {
    this.closebutton.nativeElement.click();
    this.tallasForm.reset();
  }
  submit() {
    if (this.isModalAdd === false) {
      this.editarUsuario();
    } else {
      this.agregar();
    }
  }

  handleChangeAdd() {
    if (this.tallasForm) {
      this.tallasForm.reset();
      this.isModalAdd = true;
    }
  }

  exportarDatosAExcel() {
    if (this.tallas.length === 0) {
      console.warn('La lista de tallas está vacía. No se puede exportar.');
      return;
    }

    const datosParaExportar = this.tallas.map((talla) => {
      return {
        '#': talla.id,
        Nombre: talla.nombre,
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

    this.guardarArchivoExcel(excelBuffer, 'Tallas.xlsx');
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
  handleChangeSearch(event: any) {
    const inputValue = event.target.value;
    const valueSearch = inputValue.toLowerCase();

    this.tallasFilter = this.tallas.filter((talla) =>
      talla.nombre.toLowerCase().includes(valueSearch)
    );

    this.configPaginator.currentPage = 1;
  }
  onPageChange(number: number) {
    this.configPaginator.currentPage = number;
  }
}
