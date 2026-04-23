import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, Subject, tap } from 'rxjs';
import { Empleado } from '../empleado.model.ts/empleado.model';

@Injectable({
  providedIn: 'root'
})
export class EmpleadoService {
  private http = inject(HttpClient);
  
  // Puerto actualizado según tu configuración de .NET
  private apiUrl = 'https://localhost:65460/api/Empleados'; 

  // Este Subject avisará a los componentes cuando la lista cambie
  private _refresh$ = new Subject<void>();

  get refresh$() {
    return this._refresh$;
  }

  // 1. Obtener todos los empleados (Read)
  getEmpleados(): Observable<Empleado[]> {
    return this.http.get<Empleado[]>(this.apiUrl);
  }

  // 2. Crear un nuevo empleado (Create)
  crear(empleado: Empleado): Observable<Empleado> {
    return this.http.post<Empleado>(this.apiUrl, empleado).pipe(
      tap(() => {
        this._refresh$.next(); // Dispara el refresco automático
      })
    );
  }

  // 3. Actualizar un empleado existente (Update)
  editar(id: number, empleado: Empleado): Observable<Empleado> {
    return this.http.put<Empleado>(`${this.apiUrl}/${id}`, empleado).pipe(
      tap(() => {
        this._refresh$.next(); // Dispara el refresco automático
      })
    );
  }

  // 4. Eliminar un empleado (Delete)
  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this._refresh$.next(); // Dispara el refresco automático
      })
    );
  }
}