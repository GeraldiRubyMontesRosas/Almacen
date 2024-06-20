import { Area } from "./Area";
import { Inmueble } from "./inmueble";
import { Usuario } from "./usuario";

export interface Traslado {
    id: number;
    inmueble: Inmueble | undefined;
    areaOrigen: Area;
    areaDestino: Area;
    usuario: Usuario ;
    fechaHoraCreacion: string;
}
