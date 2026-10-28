import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonRefresher,
  IonRefresherContent,
  IonList,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonBadge,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonSkeletonText
} from '@ionic/angular';
import { IncidenciaService } from '../../core/services/incidencia.service';
import { SeguimientoService } from '../../core/services/seguimiento.service';
import { Incidencia, EstadoIncidencia, PrioridadIncidencia } from '../../core/models/incidencia.model';

@Component({
  selector: 'app-incidencias-list',
  templateUrl: './incidencias-list.page.html',
  styleUrls: ['./incidencias-list.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonSearchbar,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonRefresher,
    IonRefresherContent,
    IonList,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonBadge,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonSkeletonText
  ]
})
export class IncidenciasListPage implements OnInit {
  private incidenciaService = inject(IncidenciaService);
  private seguimientoService = inject(SeguimientoService);
  private router = inject(Router);

  // Estados de datos
  todasLasIncidencias = signal<Incidencia[]>([]);
  cargandoInicial = signal<boolean>(true);
  errorConsulta = signal<string | null>(null);
  finDeRegistros = signal<boolean>(false);

  // Control de paginación remota (R3)
  paginaActual = 1;
  readonly limitePorPagina = 5;

  // Filtros
  terminoBusqueda = '';
  filtroEstado = 'todos';

  // Lista calculada según filtros aplicados
  incidenciasFiltradas = computed(() => {
    let list = this.todasLasIncidencias();

    // Filtro por estado
    if (this.filtroEstado !== 'todos') {
      list = list.filter(i => i.estado === this.filtroEstado);
    }

    // Filtro por término de búsqueda
    if (this.terminoBusqueda.trim()) {
      const q = this.terminoBusqueda.toLowerCase();
      list = list.filter(i =>
        i.codigo.toLowerCase().includes(q) ||
        i.tipo.toLowerCase().includes(q) ||
        i.direccion.toLowerCase().includes(q) ||
        i.sector.toLowerCase().includes(q) ||
        i.descripcion.toLowerCase().includes(q)
      );
    }

    return list;
  });

  ngOnInit() {
    this.cargarPagina(1, true);
  }

  ionViewWillEnter() {
    // Al regresar refresca el estado del seguimiento local
    this.seguimientoService.cargarSeguimiento();
  }

  /**
   * Carga una página desde el servicio remoto (R2 y R3).
   */
  cargarPagina(page: number, esInicial: boolean = false, event?: any) {
    if (esInicial) {
      this.cargandoInicial.set(true);
      this.errorConsulta.set(null);
    }

    this.incidenciaService.getIncidenciasPaginadas(page, this.limitePorPagina).subscribe({
      next: (registros) => {
        if (esInicial) {
          this.todasLasIncidencias.set(registros);
          this.cargandoInicial.set(false);
        } else {
          // Agregar al listado existente progresivamente
          this.todasLasIncidencias.update(prev => [...prev, ...registros]);
        }

        // R3: Si la página trajo menos registros que el límite, se agotaron los registros
        if (registros.length < this.limitePorPagina) {
          this.finDeRegistros.set(true);
        }

        if (event) {
          event.target.complete();
        }
      },
      error: (err) => {
        console.error('Error al cargar incidencias:', err);
        if (esInicial) {
          this.errorConsulta.set('No se pudo establecer conexión con el servicio de oficina.');
          this.cargandoInicial.set(false);
        }
        if (event) {
          event.target.complete();
        }
      }
    });
  }

  /**
   * Carga la siguiente página al llegar al final del scroll (R3).
   */
  cargarMas(event: any) {
    if (this.finDeRegistros()) {
      event.target.complete();
      event.target.disabled = true;
      return;
    }

    this.paginaActual++;
    this.cargarPagina(this.paginaActual, false, event);
  }

  /**
   * Recarga la lista completa desde la página 1.
   */
  handleRefresh(event: any) {
    this.paginaActual = 1;
    this.finDeRegistros.set(false);
    this.cargarPagina(1, true, event);
  }

  reiniciarLista() {
    this.paginaActual = 1;
    this.finDeRegistros.set(false);
    this.cargarPagina(1, true);
  }

  filtrar() {
    // La señal computada se actualiza automáticamente con ngModel
  }

  irADetalle(codigo: string) {
    this.router.navigate(['/detalle', codigo]);
  }

  /**
   * Alternar seguimiento local (R1). No modifica la API remota.
   */
  async toggleSeguimiento(codigo: string, event: Event) {
    event.stopPropagation();
    await this.seguimientoService.alternarSeguimiento(codigo);
  }

  esSeguimiento(codigo: string): boolean {
    return this.seguimientoService.estaMarcado(codigo);
  }

  getColorEstado(estado: EstadoIncidencia): string {
    switch (estado) {
      case 'pendiente': return 'warning';
      case 'en proceso': return 'primary';
      case 'resuelta': return 'success';
      default: return 'medium';
    }
  }

  getColorPrioridad(prioridad: PrioridadIncidencia): string {
    switch (prioridad) {
      case 'alta': return 'danger';
      case 'media': return 'tertiary';
      case 'baja': return 'medium';
      default: return 'medium';
    }
  }
}
