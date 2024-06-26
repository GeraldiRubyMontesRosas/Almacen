import { Component, Inject, ElementRef, ViewChild} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaginationInstance } from 'ngx-pagination';
import { NgxSpinnerService } from 'ngx-spinner';
import { MensajeService } from 'src/app/core/services/mensaje.service';
import { LoadingStates } from 'src/app/global/global';

import { Inmueble } from 'src/app/models/inmueble';
import { InmueblesService } from 'src/app/core/services/inmueble.service';
import { Area } from 'src/app/models/Area';
import { AreasService } from 'src/app/core/services/areas.service';
import { Options } from '@angular-slider/ngx-slider';

import * as XLSX from 'xlsx';
import * as QRCode from 'qrcode-generator';
import { TrasladosService } from 'src/app/core/services/traslados.service';
import { Traslado } from 'src/app/models/Traslado';
import { SecurityService } from 'src/app/core/services/security.service';
import { AppUserAuth } from 'src/app/models/login';
import { Usuario } from 'src/app/models/usuario';

@Component({
  selector: 'app-traslados',
  templateUrl: './traslados.component.html',
  styleUrls: ['./traslados.component.css']
})
export class TrasladosComponent {
  @ViewChild('searchItem') searchItem!: ElementRef;
  @ViewChild('closebutton') closebutton!: ElementRef;
  public isUpdatingfoto: boolean = false;
  public imgPreview: string = '';
  public QrPreview: string = '';
  trasladoForm!: FormGroup;
  cantidadForm!: FormGroup;
  QrBase64!: string;
  public isUpdatingImg: boolean = false;
  public isUpdatingEmblema: boolean = false;
  isLoading = LoadingStates.neutro;
  idUpdate!: number;
  isModalAdd = true;
  inmueble!: Inmueble;
  inmuebles: any[] = [];
  traslado!: Traslado;
  traslados: Traslado[] = [];
  trasladosFilter: Traslado[] = [];
  areas: Area[] = [];
  usuarios: Usuario[] = [];
  inmuebleFilter: Inmueble[] = [];
  imagenAmpliada: string | null = null;
  estatusBtn = true;
  verdadero = 'Activo';
  falso = 'Inactivo';
  estatusTag = this.verdadero;
  sliderValue: number = 0;
  ceil: number = 100;
  sliderOptions: Options = {
    floor: 0,
    ceil: this.ceil,
  };  
  dataObject!: AppUserAuth | null;
  filteredInmuebles = [];

  public cameraActive: boolean = false;
  @ViewChild('video', { static: false })
  public video!: ElementRef;
  @ViewChild('canvas', { static: false })
  public canvas!: ElementRef;
  public captures: Array<any> = [];
  constructor(
    @Inject('CONFIG_PAGINATOR') public configPaginator: PaginationInstance,
    private spinnerService: NgxSpinnerService,
    private mensajeService: MensajeService,
    private formBuilder: FormBuilder,
    public inmueblesService: InmueblesService,
    public areasService: AreasService,
    public trasladosService: TrasladosService,
    private securityService: SecurityService,
    private fb: FormBuilder
  ) {
    this.trasladosService.refreshListTraslado.subscribe(() =>
      this.getTraslado()
    );
    this.getTraslado();
    this.getAreas();
    this.createForm();
    this.createForm2();
  }

  ngOnInit(): void {
    this.trasladoForm.get('areasDeResgualdo')?.valueChanges.subscribe(areaId => {
      this.filterInmuebles(areaId);
    });
    this.trasladoForm.get('cantidad')?.valueChanges.subscribe(cantidad => {
      this.ceil = cantidad;
    });
  }

  filterInmuebles(areaId: number): void {
    this.filteredInmuebles != this.inmuebles.filter(inmueble => inmueble.area?.id === areaId);
  }

 
  getAreas() {
    this.isLoading = LoadingStates.trueLoading;
    this.areasService.getAll().subscribe({
      next: (dataFromAPI) => {
        this.areas = dataFromAPI;
      },
    });
  }

 
  getTraslado() {
    this.isLoading = LoadingStates.trueLoading;
    this.trasladosService.getAll().subscribe({
      next: (dataFromAPI) => {
        this.traslados = dataFromAPI;
        this.trasladosFilter = this.traslados;
        this.isLoading = LoadingStates.falseLoading;
      },
      error: () => {
        this.isLoading = LoadingStates.errorLoading;
      },
    });
  }

  createForm() {
    this.trasladoForm = this.formBuilder.group({
        id: [null],
        inmueble: ['', Validators.required],
        areaOrigen: ['', Validators.required],
        areaDestino: ['', Validators.required],
    });
}

createForm2() {
  this.cantidadForm = this.formBuilder.group({
      cantidad: ['', Validators.required],
  });
}

  resetForm() {
    this.closebutton.nativeElement.click();
    this.trasladoForm.reset();
  }

  setDataModalUpdate(dto: Traslado) {
    this.isModalAdd = false;
    this.idUpdate = dto.id;
    this.cantidadForm.patchValue({
      cantidad:dto.creadoInmueble?.cantidad
    });
    this.trasladoForm.patchValue({
      id: dto.id,
      inmueble: dto.inmueble?.id,
      areaOrigen:dto.areaOrigen.id,
      areaDestino: dto.areaDestino.id,
      usuario: dto.usuario.id,
      fechaHoraCreacion: dto.fechaHoraCreacion,
    });
    
    console.log(this.cantidadForm);

  }

  editarInmueble() {
    this.traslado = this.trasladoForm.value as Traslado;
    const inmuebleid = this.trasladoForm.get('inmueble')?.value;
    const areaDestinoId = this.trasladoForm.get('areaDestino')?.value;
    const areaOrigenId = this.trasladoForm.get('areaOrigen')?.value;
    const cantidad = this.cantidadForm.get('cantidad')?.value;
  
  
 
     const areaDestino = this.areas.find(area => area.id === areaDestinoId);
     const inmueble = this.inmuebles.find(inmueble => inmueble.id === inmuebleid);
  if (!areaDestino) {
    this.mensajeService.mensajeError('El área de destino seleccionada no es válida.');
    return;
  }

  // Validate origin area
  const areaOrigen = this.areas.find(area => area.id === areaOrigenId);
  if (!areaOrigen) {
    this.mensajeService.mensajeError('El área de origen seleccionada no es válida.');
    return;
  }
  
  if (areaOrigen === areaDestino) {
    this.mensajeService.mensajeError('El area de origen y area destino no pueden ser las misma area');
    return;
  }

  const data = { 
    ...this.traslado,
    areaDestino: areaDestino,
    areaOrigen: areaOrigen,
    inmueble: inmueble
  };

      this.spinnerService.show();

      this.trasladosService.put(this.idUpdate, data).subscribe({
        next: () => {
          this.spinnerService.hide();
          this.mensajeService.mensajeExito(
            'Inmueble actualizado correctamente'
          );
          this.resetForm();
          this.configPaginator.currentPage = 1;
        },
        error: (error) => {
          this.spinnerService.hide();
          this.mensajeService.mensajeError(error);
        },
      });
    } 
    
  

    deleteItem(id: number,id2: number,inmueble: any, cantidad: number) {
      this.mensajeService.mensajeAdvertencia(
        `¿Estás seguro de eliminar el traslado?`,
        () => {
          this.trasladosService.delete(id).subscribe({
            next: () => {
              this.mensajeService.mensajeExito('Traslado borrado correctamente');
              this.configPaginator.currentPage = 1;
              this.searchItem.nativeElement.value = '';
              this.inmueblesService.delete(id2).subscribe({
                next: () => {
                  const suma = inmueble.cantidad + cantidad;
                                   
                                   console.log('suma', suma);
                  const formData = { ...inmueble, cantidad: suma };
                  console.log('edita',formData)
                  this.inmueblesService.put(inmueble.id, formData).subscribe({
                    next: () => {
                      this.spinnerService.hide();
                      this.mensajeService.mensajeExito(
                        'Inmueble actualizado correctamente'
                      );
                      this.resetForm();
                      this.configPaginator.currentPage = 1;
                    },
                    error: (error) => {
                      this.spinnerService.hide();
                      this.mensajeService.mensajeError(error);
                    },
                  });
                },
                error: (error) => this.mensajeService.mensajeError(error),
              });
            },
            error: (error) => this.mensajeService.mensajeError(error),
          });
        }
      );
    }
    
 
    agregar() {
      this.traslado = this.trasladoForm.value as Traslado;
      const inmuebleid = this.trasladoForm.get('inmueble')?.value;
      const areaDestinoId = this.trasladoForm.get('areaDestino')?.value;
      const areaOrigenId = this.trasladoForm.get('areaOrigen')?.value;
      const cantidad = this.cantidadForm.get('cantidad')?.value;
      console.log(cantidad)
    
      const areaDestino = this.areas.find(area => area.id === areaDestinoId);
      const inmueble = this.inmuebles.find(inmueble => inmueble.id === inmuebleid);
    
      if (!areaDestino) {
        this.mensajeService.mensajeError('El área de destino seleccionada no es válida.');
        return;
      }
    
      const areaOrigen = this.areas.find(area => area.id === areaOrigenId);
      if (!areaOrigen) {
        this.mensajeService.mensajeError('El área de origen seleccionada no es válida.');
        return;
      }
    
      if (areaOrigen === areaDestino) {
        this.mensajeService.mensajeError('El área de origen y área destino no pueden ser la misma área');
        return;
      }
    
      const inmuebleSinId = { ...inmueble, area: areaDestino, cantidad:cantidad };
      delete inmuebleSinId.id; 
        const resta=inmueble.cantidad - cantidad;
        const inmuebleeditado = { ...inmueble, cantidad:resta };
        if(resta > 0){
          this.inmueblesService.post(inmuebleSinId).subscribe({
            next: (response) => {
              console.log('Respuesta del servidor:', response);
        
              if (response && response.id) {
                console.log('ID del inmueble generado:', response.id);
        
                const data = { 
                  ...this.traslado,
                  areaDestino: areaDestino,
                  areaOrigen: areaOrigen,
                  inmueble: inmueble,
                  CreadoInmueble:{ ...inmueble, id: response.id } 
                };
        
                console.log('Enviando traslado:', data);
        
                this.spinnerService.show();
        
                this.trasladosService.post(data).subscribe({
                  next: () => {
                    this.spinnerService.hide();
                    this.mensajeService.mensajeExito('Traslado guardado correctamente');
                    this.resetForm();
                    this.configPaginator.currentPage = 1;
                  },
                  error: (error) => {
                    this.spinnerService.hide();
                    this.mensajeService.mensajeError(error);
                  },
                });
                this.inmueblesService.put(inmuebleeditado.id, inmuebleeditado).subscribe({
                  next: () => {
                    this.spinnerService.hide();
                    this.mensajeService.mensajeExito(
                      'Inmueble actualizado correctamente'
                    );
                    this.resetForm();
                    this.configPaginator.currentPage = 1;
                  },
                  error: (error) => {
                    this.spinnerService.hide();
                    this.mensajeService.mensajeError(error);
                  },
                });
                
              } else {
                console.log('Respuesta del servidor no contiene un ID de inmueble válido.');
              }
            },
            error: (error) => {
              this.mensajeService.mensajeError(error);
            },
          });
        }else{
          this.mensajeService.mensajeError('El inmueble contiene piesas insificientes');
          return;
        }
    }
  

  handleChangeAdd() {
    
      this.trasladoForm.reset();
     
      this.isModalAdd = true;
    
  }

  submit() {
    if (this.isModalAdd === false) {
      this.editarInmueble();
    } else {
      this.agregar();
    }
  }


  handleChangeSearch(event: any) {
    const inputValue = event.target.value;
    const valueSearch = inputValue.toLowerCase();

    this.trasladosFilter = this.traslados.filter(
      (traslados) =>
        traslados.inmueble?.nombre.toLowerCase().includes(valueSearch) ||
        traslados.areaDestino.nombre.toLowerCase().includes(valueSearch) ||
        traslados.areaOrigen.nombre.toString().includes(valueSearch)  ||
        traslados.usuario.nombre.toString().includes(valueSearch) ||
        traslados.fechaHoraCreacion.toString().includes(valueSearch)
    );

    this.configPaginator.currentPage = 1;
  }
  onPageChange(number: number) {
    this.configPaginator.currentPage = number;
  }
  exportarDatosAExcel() {
    if (this.traslados.length === 0) {
      console.warn('La lista de traslados está vacía. No se puede exportar.');
      return;
    }

    const datosParaExportar = this.traslados.map((traslado) => {
      const fechaFormateada = new Date(traslado.fechaHoraCreacion)
.toISOString()
.split('T')[0];
      const horaFormateada = traslado.fechaHoraCreacion.toString().split('T')[1].split('.')[0];
      return {
        '#': traslado.id,
        'Inmueble': traslado.inmueble?.nombre,
        'Area de origen': traslado.areaOrigen.nombre,
        'Area de destino': traslado.areaDestino.nombre,
        'Usuario': traslado.usuario.nombre,
        'Fecha': fechaFormateada,
        'Hora': horaFormateada,

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

    this.guardarArchivoExcel(excelBuffer, 'Traslados.xlsx');
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

  inmuebleporarea(id: number) {
    this.inmueblesService.getByArea(id).subscribe({
      next: (dataFromAPI) => {
        this.inmuebles = dataFromAPI;
        this.inmuebleFilter = this.inmuebles;
       
      },
    });
  }

}