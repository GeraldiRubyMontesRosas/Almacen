import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaginationInstance } from 'ngx-pagination';
import { NgxSpinnerService } from 'ngx-spinner';
import { MensajeService } from 'src/app/core/services/mensaje.service';
import { LoadingStates } from 'src/app/global/global';
import { AreasService } from 'src/app/core/services/areas.service';
import { Area } from 'src/app/models/Area';
import * as XLSX from 'xlsx';
import { normalizeTickInterval } from 'highcharts';

@Component({
  selector: 'app-area',
  templateUrl: './area.component.html',
  styleUrls: ['./area.component.css'],
})
export class AreaComponent {
  @ViewChild('closebutton') closebutton!: ElementRef;
  @ViewChild('searchItem') searchItem!: ElementRef;

  area!: Area;
  areaForm!: FormGroup;
  areas: Area[] = [];
  areasFilter: Area[] = [];
  isLoading = LoadingStates.neutro;
  isModalAdd: boolean = true;
  formData: any;
  id!: number;
  idUpdate!: number;
  responsable!: string;
  estatusBtn = true;
  verdadero = 'Activo';
  falso = 'Inactivo';
  estatusTag = this.verdadero;

  constructor(
    @Inject('CONFIG_PAGINATOR') public configPaginator: PaginationInstance,
    private spinnerService: NgxSpinnerService,
    private mensajeService: MensajeService,
    private formBuilder: FormBuilder,
    private areasService: AreasService
  ) {
    this.areasService.refreshListAreas.subscribe(() => this.getAreas());
    this.getAreas();
    this.creteForm();
  }
  setEstatus() {
    this.estatusTag = this.estatusBtn ? this.verdadero : this.falso;
  }

  getAreas() {
    this.isLoading = LoadingStates.trueLoading;
    this.areasService.getAll().subscribe({
      next: (dataFromAPI) => {
        this.areas = dataFromAPI;
        this.areasFilter = this.areas;
        this.isLoading = LoadingStates.falseLoading;
      },
      error: () => {
        this.isLoading = LoadingStates.errorLoading;
      },
    });
  }

  creteForm() {
    this.areaForm = this.formBuilder.group({
      id: [null],
      nombre: [
        '',
        [
          Validators.required,
          Validators.maxLength(40),
          Validators.minLength(2),
          Validators.pattern(
            /^([a-zA-ZÀ-ÿ\u00C0-\u00FF]{2})[a-zA-ZÀ-ÿ\u00C0-\u00FF ]+$/
          ),
        ],
      ],
      responsable: [
        '',
        [
          Validators.required,
          Validators.maxLength(40),
          Validators.minLength(2),
          Validators.pattern(
            /^([a-zA-ZÀ-ÿ\u00C0-\u00FF]{2})[a-zA-ZÀ-ÿ\u00C0-\u00FF ]+$/
          ),
        ],
      ],
      estatus: [true],
    });
  }

  setDataModalUpdate(dto: Area) {
    this.isModalAdd = false;
    this.idUpdate = dto.id;
    this.areaForm.patchValue({
      id: dto.id,
      nombre: dto.nombre,
      responsable: dto.responsable,
      estatus: dto.estatus,
    });
  }

  editarUsuario() {
    this.area = this.areaForm.value as Area;
    this.spinnerService.show();
    this.areasService.put(this.idUpdate, this.area).subscribe({
      next: () => {
        this.spinnerService.hide();
        this.mensajeService.mensajeExito('Area actualizada correctamente');
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
      `¿Estás seguro de eliminar el area: ${nameItem}`,
      () => {
        this.areasService.delete(id).subscribe({
          next: () => {
            this.mensajeService.mensajeExito('Area borrada correctamente');
            this.configPaginator.currentPage = 1;
            this.searchItem.nativeElement.value = '';
          },
          error: (error) => this.mensajeService.mensajeError(error),
        });
      }
    );
  }

  agregar() {
    this.area = this.areaForm.value as Area;
    this.spinnerService.show();
    this.areasService.post(this.area).subscribe({
      next: () => {
        this.spinnerService.hide();
        this.mensajeService.mensajeExito('Area guardada correctamente');
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
    this.areaForm.reset();
  }

  submit() {
    if (this.isModalAdd === false) {
      this.editarUsuario();
    } else {
      this.agregar();
    }
  }

  handleChangeAdd() {
    if (this.areaForm) {
      this.areaForm.reset();
      if (this.areaForm) {
        this.areaForm.reset();
        const estatusControl = this.areaForm.get('estatus');
        if (estatusControl) {
          estatusControl.setValue(true);
        }
        this.isModalAdd = true;
      }
    }
  }

  exportarDatosAExcel() {
    if (this.areas.length === 0) {
      console.warn('La lista de areas está vacía. No se puede exportar.');
      return;
    }

    const datosParaExportar = this.areas.map((area) => {
      const estatus = area.estatus ? 'Activo' : 'Inactivo';
      return {
        '#': area.id,
        'Nombre de area': area.nombre,
        Responsable: area.responsable,
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

    this.guardarArchivoExcel(excelBuffer, 'Areas.xlsx');
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

    this.areasFilter = this.areas.filter(
      (area) =>
        area.nombre.toLowerCase().includes(valueSearch) ||
        area.responsable.toLowerCase().includes(valueSearch)
    );

    this.configPaginator.currentPage = 1;
  }

  onPageChange(number: number) {
    this.configPaginator.currentPage = number;
  }
}
