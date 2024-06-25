import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HandleErrorService } from './handle-error.service';
import { Subject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Inmueble } from 'src/app/models/inmueble';

@Injectable({
  providedIn: 'root'
})
export class InmueblesService {
  route = `${environment.apiUrl}/inmuebles`;
  private _refreshListInmueble$ = new Subject<Inmueble | null>();

  constructor(
    private http: HttpClient,
    private handleErrorService: HandleErrorService
  ) { }

  get refreshListInmuebles() {
    return this._refreshListInmueble$;
  }

  getById(id: number) {
    return this.http.get<Inmueble>(`${this.route}/obtener-por-id/${id}`);
  }

  getByCode(code: string) {
    return this.http.get<Inmueble[]>(`${this.route}/obtener-por-codigo/${code}`);
  }
  getByArea(idarea: number) {
    return this.http.get<Inmueble[]>(`${this.route}/obtener-por-area/${idarea}`);
  }

  getAll() {
    return this.http.get<Inmueble[]>(`${this.route}/obtener-todos`);
  }

  post(dto: Inmueble) {
    return this.http.post<Inmueble>(`${this.route}/crear`, dto)
      .pipe(
        tap(() => {
          this._refreshListInmueble$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

  put(id: number, dto: Inmueble) {
    return this.http.put<Inmueble>(`${this.route}/actualizar/${id}`, dto)
      .pipe(
        tap(() => {
          this._refreshListInmueble$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

  delete(id: number) {
    return this.http.delete(`${this.route}/eliminar/${id}`)
      .pipe(
        tap(() => {
          this._refreshListInmueble$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }
}
