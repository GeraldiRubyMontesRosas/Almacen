
import { Responsable } from "./Responsable";
import { Rol } from "./rol"

export interface Usuario {
    id: number;
    nombreCompleto: string;
    nombre: string;
    correo: string;
    password: string;
    estatus: boolean;
    rol: Rol;
    responsable?: Responsable | null;

}
