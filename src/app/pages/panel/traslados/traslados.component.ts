import { Component, Inject, ElementRef, ViewChild, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-traslados',
  templateUrl: './traslados.component.html',
  styleUrls: ['./traslados.component.css']
})
export class TrasladosComponent implements OnInit {
  @ViewChild('searchItem') searchItem!: ElementRef;
  @ViewChild('closebutton') closebutton!: ElementRef;
  @ViewChild('video', { static: false }) public video!: ElementRef;
  @ViewChild('canvas', { static: false }) public canvas!: ElementRef;

  public isUpdatingfoto: boolean = false;
  public imgPreview: string = '';
  public QrPreview: string = '';
  public QrBase64!: string;
  public isUpdatingImg: boolean = false;
  public isUpdatingEmblema: boolean = false;
  public isLoading = LoadingStates.neutro;
  public idUpdate!: number;
  public isModalAdd = true;
  public inmueble!: Inmueble;
  public inmuebles: Inmueble[] = [];
  public areas: Area[] = [];
  public inmuebleFilter: Inmueble[] = [];
  public imagenAmpliada: string | null = null;
  public estatusBtn = true;
  public verdadero = 'Activo';
  public falso = 'Inactivo';
  public estatusTag = this.verdadero;
  public sliderValue: number = 0;
  public ceil: number = 100;
  public sliderOptions: Options = {
    floor: 0,
    ceil: this.ceil,
  };  
  public filteredInmuebles = [];
  public cameraActive: boolean = false;
  public captures: Array<any> = [];
  public inmueblesForm!: FormGroup;

  constructor(
    @Inject('CONFIG_PAGINATOR') public configPaginator: PaginationInstance,
    private spinnerService: NgxSpinnerService,
    private mensajeService: MensajeService,
    private formBuilder: FormBuilder,
    public inmueblesService: InmueblesService,
    public areasService: AreasService
  ) {
    this.inmueblesService.refreshListInmuebles.subscribe(() => this.getInmuebles());
    this.getInmuebles();
    this.createForm();
    this.getAreas();
  }

  ngOnInit(): void {
    //this.inmueblesForm.get('areasDeResgualdo')?.valueChanges.subscribe(areaId => {
      //this.filterInmuebles(areaId);
    //});
    this.inmueblesForm.get('cantidad')?.valueChanges.subscribe(cantidad => {
      this.ceil = cantidad;
    });
  }

  createForm() {
    this.inmueblesForm = this.formBuilder.group({
      id: [null],
      codigo: [''],
      nombre: [''],
      cantidad: ['', [Validators.maxLength(10), Validators.required]],
      descripcion: [''],
      imagenBase64: [''],
      qrBase64: [''],
      areasDeResgualdo: [null, Validators.required],
      estatus: [true],
      costoUnitario: [''],
      inmueble: [''],
    });
  }

 // filterInmuebles(areaId: number): void {
 //   this.filteredInmuebles = this.inmuebles.filter(inmueble => inmueble.area?.id === areaId);
  //}

  setEstatus() {
    this.estatusTag = this.estatusBtn ? this.verdadero : this.falso;
  }

  getAreas() {
    this.isLoading = LoadingStates.trueLoading;
    this.areasService.getAll().subscribe({
      next: (dataFromAPI) => {
        this.areas = dataFromAPI;
        this.isLoading = LoadingStates.falseLoading;
      },
      error: () => {
        this.isLoading = LoadingStates.errorLoading;
      },
    });
  }

  getInmuebles() {
    this.isLoading = LoadingStates.trueLoading;
    this.inmueblesService.getAll().subscribe({
      next: (dataFromAPI) => {
        this.inmuebles = dataFromAPI;
        this.inmuebleFilter = this.inmuebles;
        this.isLoading = LoadingStates.falseLoading;
      },
      error: () => {
        this.isLoading = LoadingStates.errorLoading;
      },
    });
  }

  resetForm() {
    this.closebutton.nativeElement.click();
    this.inmueblesForm.reset();
  }

  setDataModalUpdate(dto: Inmueble) {
    this.isModalAdd = false;
    this.idUpdate = dto.id;
    this.inmueblesForm.patchValue({
      id: dto.id,
      codigo: dto.codigo,
      nombre: dto.nombre,
      cantidad: dto.cantidad,
      descripcion: dto.descripcion,
      imagenBase64: '',
      qrBase64: '',
      estatus: dto.estatus,
      areasDeResgualdo: dto.area ? dto.area.id : null,
    });
  }

  editarInmueble() {
    this.inmueble = this.inmueblesForm.value as Inmueble;
    const inmuebleId = this.inmueblesForm.get('id')?.value;
    const areaId = this.inmueblesForm.get('areasDeResgualdo')?.value;
    const imagenBase64 = this.inmueblesForm.get('imagenBase64')?.value;
    const qrBase64 = this.inmueblesForm.get('qrBase64')?.value;

    this.imgPreview = '';
    this.QrPreview = '';

    this.inmueble.area = { id: areaId } as Area;

    if (!imagenBase64 && !qrBase64) {
      const formData = { ...this.inmueble };

      this.spinnerService.show();

      this.inmueblesService.put(inmuebleId, formData).subscribe({
        next: () => {
          this.spinnerService.hide();
          this.mensajeService.mensajeExito('Inmueble actualizado correctamente');
          this.resetForm();
          this.configPaginator.currentPage = 1;
        },
        error: (error) => {
          this.spinnerService.hide();
          this.mensajeService.mensajeError(error);
        },
      });
    } else if (imagenBase64 && qrBase64) {
      const formData = { ...this.inmueble, imagenBase64, qrBase64 };
      this.spinnerService.show();

      this.inmueblesService.put(inmuebleId, formData).subscribe({
        next: () => {
          this.spinnerService.hide();
          this.mensajeService.mensajeExito('Inmueble actualizado correctamente');
          this.resetForm();
          this.configPaginator.currentPage = 1;
        },
        error: (error) => {
          this.spinnerService.hide();
          this.mensajeService.mensajeError(error);
        },
      });
    } else {
      console.error('Error: No se encontró una representación válida en base64 de la imagen.');
    }
  }

  deleteItem(id: number, nameItem: string) {
    this.mensajeService.mensajeAdvertencia(
      `¿Estás seguro de eliminar el inmueble: ${nameItem}?`,
      () => {
        this.inmueblesService.delete(id).subscribe({
          next: () => {
            this.mensajeService.mensajeExito('Inmueble borrado correctamente');
            this.configPaginator.currentPage = 1;
            this.searchItem.nativeElement.value = '';
          },
          error: (error) => this.mensajeService.mensajeError(error),
        });
      }
    );
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
          imagenBase64: base64WithoutPrefix,
        });
      };
      this.isUpdatingfoto = false;
      reader.readAsDataURL(file);
    }
  }

  async generarID() {
    const nombreControl = this.inmueblesForm.get('nombre');

    if (nombreControl) {
      const nombre = nombreControl.value.toUpperCase();

      const letraAleatoria = String.fromCharCode(65 + Math.floor(Math.random() * 26)).toUpperCase();
      const numerosAleatorios = Array.from({ length: 4 }, () => Math.floor(Math.random() * 10)).join('');
      const codigoGenerado = `${nombre.substring(0, 3)}${letraAleatoria}${numerosAleatorios}`;

      this.inmueblesForm.patchValue({
        codigo: codigoGenerado,
      });

      const qr = QRCode(0, 'H');
      qr.addData(codigoGenerado);
      qr.make();
      const qrBase64 = qr.createDataURL();

      const qrBase64WithoutPrefix = qrBase64.split(';base64,').pop() || '';
      this.QrPreview = qrBase64;
      this.QrBase64 = qrBase64WithoutPrefix;

      this.inmueblesForm.patchValue({
        qrBase64: this.QrBase64,
      });
    }
  }

  activarCamara() {
    this.cameraActive = true;

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        const video = this.video.nativeElement;
        video.srcObject = stream;
        video.play();
      });
    }
  }

  capturarImagen() {
    const context = this.canvas.nativeElement.getContext('2d');
    context.drawImage(this.video.nativeElement, 0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);

    const imageData = this.canvas.nativeElement.toDataURL('image/png');
    this.captures.push(imageData);
    this.imgPreview = imageData;
  }

  cerrarCamara() {
    this.cameraActive = false;

    const video = this.video.nativeElement;
    const stream = video.srcObject as MediaStream;

    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
    }
  }

  cargarInmueblesDesdeExcel(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = (e: ProgressEvent<FileReader>) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

        console.log(jsonData);
      };

      reader.readAsArrayBuffer(file);
    }
  }
  submit() {
    if (this.isModalAdd === false) {
      this.editarInmueble();
    } else {
    
    }
  }
}
