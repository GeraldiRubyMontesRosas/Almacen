import { Responsable } from "./Responsable";

export interface Area {
  id: number;
  nombre: string;
  responsable?: Responsable;
  estatus: boolean;
}
 