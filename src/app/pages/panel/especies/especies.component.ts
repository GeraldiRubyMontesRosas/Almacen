import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaginationInstance } from 'ngx-pagination';
import { NgxSpinnerService } from 'ngx-spinner';
import { EspeciesService } from 'src/app/core/services/especies.servie';
import { MensajeService } from 'src/app/core/services/mensaje.service';
import { LoadingStates } from 'src/app/global/global';
import { Especie } from 'src/app/models/especie';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-especies',
  templateUrl: './especies.component.html',
  styleUrls: ['./especies.component.css'],
})
export class EspeciesComponent {
  @ViewChild('searchItem') searchItem!: ElementRef;
  @ViewChild('closebutton') closebutton!: ElementRef;

  especie!: Especie;
  especies: Especie[] = [];
  especieForm!: FormGroup;
  especieFilter: Especie[] = [];
  isLoading = LoadingStates.neutro;
  idUpdate!: number;
  isModalAdd = true;

  constructor(
    @Inject('CONFIG_PAGINATOR') public configPaginator: PaginationInstance,
    private spinnerService: NgxSpinnerService,
    private mensajeService: MensajeService,
    private formBuilder: FormBuilder,
    private especiesService: EspeciesService
  ) {
    this.especiesService.refreshListEspecies.subscribe(() =>
      this.getEspecies()
    );
    this.getEspecies();
    this.creteForm();
  }
  getEspecies() {
    this.isLoading = LoadingStates.trueLoading;
    this.especiesService.getAll().subscribe({
      next: (dataFromAPI) => {
        this.especies = dataFromAPI;
        this.especieFilter = this.especies;
        this.isLoading = LoadingStates.falseLoading;
      },
      error: () => {
        this.isLoading = LoadingStates.errorLoading;
      },
    });
  }
  creteForm() {
    this.especieForm = this.formBuilder.group({
      id: [null],
      nombre: [
        '',
        [
          Validators.maxLength(22),
          Validators.minLength(2),
          Validators.required,
          Validators.pattern(
            /^([a-zA-ZÀ-ÿ\u00C0-\u00FF]{2})[a-zA-ZÀ-ÿ\u00C0-\u00FF ]+$/
          ),
        ],
      ],
    });
  }

  setDataModalUpdate(dto: Especie) {
    this.isModalAdd = false;
    this.idUpdate = dto.id;
    this.especieForm.patchValue({
      id: dto.id,
      nombre: dto.nombre,
    });
  }

  editarUsuario() {
    this.especie = this.especieForm.value as Especie;
    this.spinnerService.show();
    this.especiesService.put(this.idUpdate, this.especie).subscribe({
      next: () => {
        this.spinnerService.hide();
        this.mensajeService.mensajeExito('Especie actualizada correctamente');
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
      `¿Estás seguro de eliminar la especie: ${nameItem}?`,
      () => {
        this.especiesService.delete(id).subscribe({
          next: () => {
            this.mensajeService.mensajeExito('Especie borrada correctamente');
            this.configPaginator.currentPage = 1;
            this.searchItem.nativeElement.value = '';
          },
          error: (error) => this.mensajeService.mensajeError(error),
        });
      }
    );
  }
  agregar() {
    this.especie = this.especieForm.value as Especie;
    this.spinnerService.show();
    this.especiesService.post(this.especie).subscribe({
      next: () => {
        this.spinnerService.hide();
        this.mensajeService.mensajeExito('Especie guardada correctamente');
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
    this.especieForm.reset();
  }
  submit() {
    if (this.isModalAdd === false) {
      this.editarUsuario();
    } else {
      this.agregar();
    }
  }

  handleChangeAdd() {
    if (this.especieForm) {
      this.especieForm.reset();
      this.isModalAdd = true;
    }
  }
  exportarDatosAExcel() {
    if (this.especies.length === 0) {
      console.warn('La lista de especies está vacía. No se puede exportar.');
      return;
    }

    const datosParaExportar = this.especies.map((especie) => {
      return {
        '#': especie.id,
        Nombre: especie.nombre,
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

    this.guardarArchivoExcel(excelBuffer, 'Especies.xlsx');
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

    this.especieFilter = this.especies.filter((especie) =>
      especie.nombre.toLowerCase().includes(valueSearch)
    );

    this.configPaginator.currentPage = 1;
  }

  onPageChange(number: number) {
    this.configPaginator.currentPage = number;
  }
}
