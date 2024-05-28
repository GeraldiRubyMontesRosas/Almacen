import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HandleErrorService } from './handle-error.service';
import { Subject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Tallas } from 'src/app/models/tallas';

@Injectable({
  providedIn: 'root'
})
export class TallasService {
  route = `${environment.apiUrl}/Tamaños`;
  private _refreshListTallas$ = new Subject<Tallas | null>();

  constructor(
    private http: HttpClient,
    private handleErrorService: HandleErrorService
  ) { }

  get refreshListTallas() {
    return this._refreshListTallas$;
  }

  getById(id: number) {
    return this.http.get<Tallas>(`${this.route}/obtener-por-id/${id}`);
  }

  getAll() {
    return this.http.get<Tallas[]>(`${this.route}/obtener-todos`);
  }

  post(dto: Tallas) {
    return this.http.post<Tallas>(`${this.route}/crear`, dto)
      .pipe(
        tap(() => {
          this._refreshListTallas$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

  put(id: number, dto: Tallas) {
    return this.http.put<Tallas>(`${this.route}/actualizar/${id}`, dto)
      .pipe(
        tap(() => {
          this._refreshListTallas$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

  delete(id: number) {
    return this.http.delete(`${this.route}/eliminar/${id}`)
      .pipe(
        tap(() => {
          this._refreshListTallas$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }
}
