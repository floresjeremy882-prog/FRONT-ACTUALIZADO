import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms'; 
import { EmpleadoService } from './services/empleado.service';
import { Empleado } from './empleado.model.ts/empleado.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], 
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  private empleadoService = inject(EmpleadoService);

  public listaEmpleados: Empleado[] = [];
  public idEmpleadoEditar: number | null = null;
  public filtroEstado: string = 'todos';

  // --- MODIFICACIÓN: Agregado fechaIngreso al Formulario ---
  public formEmpleado = new FormGroup({
    nombre: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    cargo: new FormControl('', [Validators.required]),
    fechaIngreso: new FormControl('', [Validators.required]), // Nuevo campo
    estaActivo: new FormControl(true)
  });

  get empleadosFiltrados() {
    if (this.filtroEstado === 'activos') {
      return this.listaEmpleados.filter(e => e.estaActivo);
    } else if (this.filtroEstado === 'inactivos') {
      return this.listaEmpleados.filter(e => !e.estaActivo);
    }
    return this.listaEmpleados;
  }

  ngOnInit(): void {
    this.obtenerEmpleados();
    this.empleadoService.refresh$.subscribe(() => {
      this.obtenerEmpleados();
    });
  }

  obtenerEmpleados(): void {
    this.empleadoService.getEmpleados().subscribe({
      next: (datos) => {
        this.listaEmpleados = datos;
      },
      error: (falla) => console.error('Error al cargar:', falla)
    });
  }

  seleccionarEmpleado(emp: Empleado) {
    this.idEmpleadoEditar = emp.id!;
    
    // --- MODIFICACIÓN: Formatear fecha para el input tipo 'date' ---
    // Los inputs de tipo date requieren formato YYYY-MM-DD
    let fechaFormateada = '';
    if (emp.fechaIngreso) {
      fechaFormateada = new Date(emp.fechaIngreso).toISOString().split('T')[0];
    }

    this.formEmpleado.patchValue({
      nombre: emp.nombre,
      email: emp.email,
      cargo: emp.cargo,
      fechaIngreso: fechaFormateada, // Cargamos la fecha en el input
      estaActivo: emp.estaActivo
    });
  }

  guardar(): void {
    if (this.formEmpleado.invalid) return;

    const correoAChecar = this.formEmpleado.value.email?.toLowerCase();
    const existe = this.listaEmpleados.some(e => 
      e.email.toLowerCase() === correoAChecar && e.id !== this.idEmpleadoEditar
    );

    if (existe) {
      alert('¡Atención! Este correo ya está registrado con otro empleado.');
      return;
    }

    // --- MODIFICACIÓN: Usar la fecha del formulario ---
    const objetoEmpleado: Empleado = {
      nombre: this.formEmpleado.value.nombre!,
      email: this.formEmpleado.value.email!,
      cargo: this.formEmpleado.value.cargo!,
      fechaIngreso: new Date(this.formEmpleado.value.fechaIngreso!), // Fecha manual
      estaActivo: this.formEmpleado.value.estaActivo!
    };

    if (this.idEmpleadoEditar) {
      this.empleadoService.editar(this.idEmpleadoEditar, objetoEmpleado).subscribe({
        next: () => this.finalizarAccion(),
        error: (e) => console.error('Error al editar:', e)
      });
    } else {
      this.empleadoService.crear(objetoEmpleado).subscribe({
        next: () => this.finalizarAccion(),
        error: (e) => console.error('Error al crear:', e)
      });
    }
  }

  finalizarAccion() {
    this.formEmpleado.reset({ estaActivo: true });
    this.idEmpleadoEditar = null;
  }

  eliminar(id: number): void {
    if (confirm('¿Deseas eliminar este registro?')) {
      this.empleadoService.eliminar(id).subscribe({
        next: () => console.log('Eliminado'),
        error: (e) => console.error('Error al eliminar:', e)
      });
    }
  }
}