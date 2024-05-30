import { Area } from "./Area";

export interface Inmueble {
    id: number;
    codigo: string;
    nombre: string;
    cantidad: number;
    descripcion: string;
    area?: Area;
    imagen: string;
    imagenBase64: string;
    qr: string;
    qrBase64:string;

  }
  