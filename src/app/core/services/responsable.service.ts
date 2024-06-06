import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HandleErrorService } from './handle-error.service';
import { Subject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Responsable } from 'src/app/models/Responsable';

@Injectable({
  providedIn: 'root'
})
export class ResponsableService {
  route = `${environment.apiUrl}/Responsable`;
  private _refreshListResponsable$ = new Subject<Responsable | null>();

  constructor(
    private http: HttpClient,
    private handleErrorService: HandleErrorService
  ) { }

  get refreshListTallas() {
    return this._refreshListResponsable$;
  }

  getById(id: number) {
    return this.http.get<Responsable>(`${this.route}/obtener-por-id/${id}`);
  }

  getAll() {
    return this.http.get<Responsable[]>(`${this.route}/obtener-todos`);
  }

  post(dto: Responsable) {
    return this.http.post<Responsable>(`${this.route}/crear`, dto)
      .pipe(
        tap(() => {
          this._refreshListResponsable$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

  put(id: number, dto: Responsable) {
    return this.http.put<Responsable>(`${this.route}/actualizar/${id}`, dto)
      .pipe(
        tap(() => {
          this._refreshListResponsable$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

  delete(id: number) {
    return this.http.delete(`${this.route}/eliminar/${id}`)
      .pipe(
        tap(() => {
          this._refreshListResponsable$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }
}
