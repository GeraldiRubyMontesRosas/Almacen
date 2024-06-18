import { Component, ElementRef, ViewChild,OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { Options } from '@angular-slider/ngx-slider';
import { PaginationInstance } from 'ngx-pagination';
import { NgxSpinnerService } from 'ngx-spinner';
import { InmueblesService } from 'src/app/core/services/inmueble.service';
import { MensajeService } from 'src/app/core/services/mensaje.service';
import { LoadingStates } from 'src/app/global/global';
import { Inmueble } from 'src/app/models/inmueble';
import { Area } from 'src/app/models/Area';
import { AreasService } from 'src/app/core/services/areas.service';

@Component({
  selector: 'app-scanner',
  templateUrl: './scanner.component.html',
  styleUrls: ['./scanner.component.css'],
})
export class ScannerComponent {
  @ViewChild('previewVideo') previewVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('searchItem') searchItem!: ElementRef;
  @ViewChild('closebutton') closebutton!: ElementRef;
  public isUpdatingfoto: boolean = false;
  cameraActive: boolean = false;
  mediaStream: MediaStream | null = null;
  public isUpdatingImg: boolean = false;
  public isUpdatingqr: boolean = false;
  isLoading = LoadingStates.neutro;
  inmueble!: Inmueble;
  inmuebles: Inmueble[] = [];
  inmueblesForm!: FormGroup;
  public imgPreview: string = '';
  public QrPreview: string = '';
  inmueblesFilter: Inmueble[] = [];
  inmuebleFilter: Inmueble[] = [];
  idUpdate!: number;
  imagenAmpliada: string | null = null;
  isModalAdd = true;
  areas: Area[] = [];
  sliderValue: number = 50;
  sliderOptions: Options = {
    floor: 0,
    ceil: 100
  };
  codigo!: string;

  @ViewChild('video', { static: false })
  public video!: ElementRef;
  @ViewChild('canvas', { static: false })
  public canvas!: ElementRef;
  public captures: Array<any> = [];
  
  constructor(
    @Inject('CONFIG_PAGINATOR') public configPaginator: PaginationInstance,
    private formBuilder: FormBuilder,
    private inmueblesService: InmueblesService,
    private spinnerService: NgxSpinnerService,
    private mensajeService: MensajeService,
    public areasService: AreasService
  ) {
    this.creteForm();
    this.getAreas();
   
  }
  toggleCamera() {
    this.cameraActive = !this.cameraActive;
  }
  
  creteForm() {
    this.inmueblesForm = this.formBuilder.group({
      id: [null],
      codigo: [''],
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
      qrBase64: [''],
      area: [null, Validators.required],
      estatus: [true],
      costo: ['', [Validators.maxLength(10), Validators.required]]
    });
  }


  handleScanSuccess(e: any) {
    console.log('Scan result:', e);
    this.codigo = e;
    this.isLoading = LoadingStates.trueLoading;
    this.inmueblesService.getByCode(e).subscribe({
      next: (dataFromAPI) => {
        if (dataFromAPI) {
          this.inmuebles = dataFromAPI;
          this.inmuebleFilter = this.inmuebles;
          console.log('1',this.inmuebles)
        } 
        this.isLoading = LoadingStates.falseLoading;
        this.cameraActive = false;
      },
      error: () => {
        this.isLoading = LoadingStates.errorLoading;
      },
    });
  }
  clearInmuebles() {
    this.inmuebles = [];
    this.inmuebleFilter = [];
  }

  getAreas() {
    this.isLoading = LoadingStates.trueLoading;
    this.areasService.getAll().subscribe({
      next: (dataFromAPI) => {
        this.areas = dataFromAPI;
      },
    });
  }

  mostrarImagenAmpliada(rutaImagen: string) {
    this.imagenAmpliada = rutaImagen;
    const modal = document.getElementById('modal-imagen-ampliada');
    if (modal) {
      modal.classList.add('show');
      modal.style.display = 'block';
    }
  }

  
  deleteItem(id: number, nameItem: string) {
    this.mensajeService.mensajeAdvertencia(
      `¿Estás seguro de eliminar el inmueble: ${nameItem}?`,
      () => {
        this.inmueblesService.delete(id).subscribe({
          next: () => {
            this.mensajeService.mensajeExito('Inmueble borrado correctamente');
            if (this.searchItem) {
              this.searchItem.nativeElement.value = '';
            }
            this.clearInmuebles();
            console.log('2', this.inmuebles);
          },
          error: (error) => this.mensajeService.mensajeError(error),
        });
      }
    );
  }

  setDataModalUpdate(dto: Inmueble) {
    this.isModalAdd = false;
    this.idUpdate = dto.id;
    const inmueble = this.inmuebleFilter.find(
      (inmueble) => inmueble.id === dto.id
    );
    this.imgPreview = inmueble!.imagen;
    this.QrPreview = inmueble!.qr;
    this.isUpdatingImg = true;
    this.isUpdatingqr = true;

    this.inmueblesForm.patchValue({
      id: dto.id,
      codigo: dto.codigo,
      nombre: dto.nombre,
      cantidad: dto.cantidad,
      descripcion: dto.descripcion,
      imagenBase64: '',
      QrBase64: '',
      estatus: dto.estatus,
      area: dto.area ? dto.area.id : null,
      costo:dto.costo
    });
    console.log(dto);
  }

  mostrarImagenAmpliada2(urlImagen: string) {
    const imagen = new Image();
    imagen.onload = () => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = imagen.width;
        canvas.height = imagen.height;
        context.drawImage(imagen, 0, 0);

        const impresora = window.open('', '_blank');
        if (impresora) {
          impresora.document.write(
            `<img src="${urlImagen}" style="max-width: 100%; max-height: 100%;" />`
          );
          impresora.document.write('<script>window.print();</script>');
        } else {
          console.error('No se pudo abrir la ventana de impresión.');
        }
      } else {
        console.error('No se pudo obtener el contexto 2D del lienzo.');
      }
    };
    imagen.src = urlImagen;
  }

  onPageChange(number: number) {
    this.configPaginator.currentPage = number;
  }

  submit() {
    if (this.isModalAdd === false) {
      this.editarInmueble();
    } 
  }

  editarInmueble() {
    this.inmueble = this.inmueblesForm.value as Inmueble;
    const inmueble = this.inmueblesForm.get('id')?.value;
    const area = this.inmueblesForm.get('area')?.value;
    const imagenBase64 = this.inmueblesForm.get('imagenBase64')?.value;
    const QrBase64 = this.inmueblesForm.get('QrBase64')?.value;
    const areaId = this.inmueblesForm.get('area')?.value;
    console.log(imagenBase64);
    console.log(QrBase64);
    const areaSeleccionada = this.areas.find((area) => area.id === areaId);
    if (!areaSeleccionada) {
      this.mensajeService.mensajeError(
        'El área de resguardo seleccionada no es válida.'
      );
      return;
    }

    this.imgPreview = '';
    this.QrPreview = '';

    this.inmueble.area = { id: area } as Area;

    if (!imagenBase64 && !QrBase64) {
      // Crear el objeto inmueble con el área completa
      const formData = { ...this.inmueble, area: areaSeleccionada };

      console.log(formData);

      this.spinnerService.show();

      this.inmueblesService.put(inmueble, formData).subscribe({
        next: () => {
          this.spinnerService.hide();
          this.mensajeService.mensajeExito(
            'Inmueble actualizado correctamente'
          );
          this.handleScanSuccess(this.codigo);
          this.resetForm();
          this.configPaginator.currentPage = 1;
        },
        error: (error) => {
          this.spinnerService.hide();
          this.mensajeService.mensajeError(error);
        },
      });
    } else if (imagenBase64) {
      const formData = {
        ...this.inmueble,
        imagenBase64,
        QrBase64,
        area: areaSeleccionada,
      };
      this.spinnerService.show();

      this.inmueblesService.put(inmueble, formData).subscribe({
        next: () => {
          this.spinnerService.hide();
          this.mensajeService.mensajeExito(
            'Inmueble actualizado correctamente'
          );
          this.handleScanSuccess(this.codigo);
          this.resetForm();
          this.configPaginator.currentPage = 1;
        },
        error: (error) => {
          this.spinnerService.hide();
          this.mensajeService.mensajeError(error);
        },
      });
    } else {
      console.error(
        'Error: No se encontró una representación válida en base64 de la imagen.'
      );
    }
  }
  resetForm() {
    this.closebutton.nativeElement.click();
    this.inmueblesForm.reset();
  }
  public capture() {
    const context = this.canvas.nativeElement.getContext('2d');
    context.drawImage(this.video.nativeElement, 0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
    const base64Image = this.canvas.nativeElement.toDataURL('image/png').split(',')[1];
    this.inmueblesForm.patchValue({
      imagenBase64 : base64Image
    });
  }

  onFileChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.isUpdatingImg = false;
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

  toggleCamera2(event: Event): void {
    event.preventDefault();
    this.cameraActive = !this.cameraActive;
    if (this.cameraActive) {
      this.startCamera();
    } else {
      this.stopCamera();
    }
  }

  startCamera() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
        this.video.nativeElement.srcObject = stream;
        this.video.nativeElement.play();

        this.video.nativeElement.onloadedmetadata = () => {
          this.canvas.nativeElement.width = this.video.nativeElement.videoWidth;
          this.canvas.nativeElement.height = this.video.nativeElement.videoHeight;
        };
      });
    }
  }

  stopCamera() {
    let stream = this.video.nativeElement.srcObject as MediaStream;
    if (stream) {
      let tracks = stream.getTracks();
      tracks.forEach(function(track) {
        track.stop();
      });
      this.video.nativeElement.srcObject = null;
    }
  }
}