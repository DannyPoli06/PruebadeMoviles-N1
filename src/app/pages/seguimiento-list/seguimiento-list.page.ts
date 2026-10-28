import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonList,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonBadge,
  IonSkeletonText
} from '@ionic/angular';
import { IncidenciaService } from '../../core/services/incidencia.service';
import { SeguimientoService } from '../../core/services/seguimiento.service';
import { Incidencia, EstadoIncidencia } from '../../core/models/incidencia.model';

@Component({
  selector: 'app-seguimiento-list',
  templateUrl: './seguimiento-list.page.html',
  styleUrls: ['./seguimiento-list.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonList,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonBadge,
    IonSkeletonText
  ]
})
export class SeguimientoListPage implements OnInit {
  private incidenciaService = inject(IncidenciaService);
  private seguimientoService = inject(SeguimientoService);
  private router = inject(Router);

  cargando = signal<boolean>(true);
  incidenciasSeguidas = signal<Incidencia[]>([]);

  ngOnInit() {
    this.cargarSeguimientos();
  }

  ionViewWillEnter() {
    this.cargarSeguimientos();
  }

  /**
   * Carga únicamente las incidencias que están marcadas localmente (R1).
   */
  async cargarSeguimientos() {
    this.cargando.set(true);
    const codigos = await this.seguimientoService.cargarSeguimiento();

    if (codigos.length === 0) {
      this.incidenciasSeguidas.set([]);
      this.cargando.set(false);
      return;
    }

    this.incidenciaService.getTodasIncidencias().subscribe({
      next: (todas) => {
        // Filtrar exclusivamente las que tengan su código en la lista local
        const filtradas = todas.filter(i => codigos.includes(i.codigo));
        this.incidenciasSeguidas.set(filtradas);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
      }
    });
  }

  /**
   * Desmarcar incidencia del seguimiento local (R1).
   * Desaparece de inmediato sin tocar el servicio remoto.
   */
  async desmarcar(codigo: string) {
    await this.seguimientoService.alternarSeguimiento(codigo);
    this.incidenciasSeguidas.update(prev => prev.filter(i => i.codigo !== codigo));
  }

  irADetalle(codigo: string) {
    this.router.navigate(['/detalle', codigo]);
  }

  getColorEstado(estado: EstadoIncidencia): string {
    switch (estado) {
      case 'pendiente': return 'warning';
      case 'en proceso': return 'primary';
      case 'resuelta': return 'success';
      default: return 'medium';
    }
  }
}
