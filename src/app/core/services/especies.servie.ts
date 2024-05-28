import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HandleErrorService } from './handle-error.service';
import { Subject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Especie } from 'src/app/models/especie';

@Injectable({
  providedIn: 'root'
})
export class EspeciesService {
  route = `${environment.apiUrl}/especies`;
  private _refreshListEspecies$ = new Subject<Especie | null>();

  constructor(
    private http: HttpClient,
    private handleErrorService: HandleErrorService
  ) { }

  get refreshListEspecies() {
    return this._refreshListEspecies$;
  }

  getById(id: number) {
    return this.http.get<Especie>(`${this.route}/obtener-por-id/${id}`);
  }

  getAll() {
    return this.http.get<Especie[]>(`${this.route}/obtener-todos`);
  }

  post(dto: Especie) {
    return this.http.post<Especie>(`${this.route}/crear`, dto)
      .pipe(
        tap(() => {
          this._refreshListEspecies$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

  put(id: number, dto: Especie) {
    return this.http.put<Especie>(`${this.route}/actualizar/${id}`, dto)
      .pipe(
        tap(() => {
          this._refreshListEspecies$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

  delete(id: number) {
    return this.http.delete(`${this.route}/eliminar/${id}`)
      .pipe(
        tap(() => {
          this._refreshListEspecies$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }
}
