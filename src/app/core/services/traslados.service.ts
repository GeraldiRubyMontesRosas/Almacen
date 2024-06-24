import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HandleErrorService } from './handle-error.service';
import { Subject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Traslado } from 'src/app/models/Traslado';

@Injectable({
  providedIn: 'root'
})
export class TrasladosService {
  route = `${environment.apiUrl}/traslado`;
  private _refreshListTraslado$ = new Subject<Traslado | null>();

  constructor(
    private http: HttpClient,
    private handleErrorService: HandleErrorService
  ) { }

  get refreshListTraslado() {
    return this._refreshListTraslado$;
  }

  getById(id: number) {
    return this.http.get<Traslado>(`${this.route}/obtener-por-id/${id}`);
  }

  getAll() {
    return this.http.get<Traslado[]>(`${this.route}/obtener-todos`);
  }

  post(dto: Traslado) {
    return this.http.post<Traslado>(`${this.route}/crear`, dto)
      .pipe(
        tap(() => {
          this._refreshListTraslado$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

  put(id: number, dto: Traslado) {
    return this.http.put<Traslado>(`${this.route}/actualizar/${id}`, dto)
      .pipe(
        tap(() => {
          this._refreshListTraslado$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

  delete(id: number) {
    return this.http.delete(`${this.route}/eliminar/${id}`)
      .pipe(
        tap(() => {
          this._refreshListTraslado$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }
}
