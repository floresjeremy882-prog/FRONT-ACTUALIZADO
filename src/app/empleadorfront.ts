import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmpleadoService } from './services/empleado.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  private service = inject(EmpleadoService);
  lista: any[] = [];

  ngOnInit() {
    this.service.getEmpleados().subscribe({
      next: (res) => this.lista = res,
      error: (e) => console.error("Error API:", e)
    });
  }
}