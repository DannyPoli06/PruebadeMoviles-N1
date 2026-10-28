import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonBackButton,
  IonIcon,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonSpinner,
  AlertController,
  ToastController
} from '@ionic/angular';
import { IncidenciaService } from '../../core/services/incidencia.service';
import { SeguimientoService } from '../../core/services/seguimiento.service';
import { Incidencia, EstadoIncidencia, PrioridadIncidencia } from '../../core/models/incidencia.model';

@Component({
  selector: 'app-incidencia-detail',
  templateUrl: './incidencia-detail.page.html',
  styleUrls: ['./incidencia-detail.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonBackButton,
    IonIcon,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonList,
    IonItem,
    IonLabel,
    IonBadge,
    IonSpinner
  ]
})
export class IncidenciaDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);

  private incidenciaService = inject(IncidenciaService);
  private seguimientoService = inject(SeguimientoService);

  cargando = signal<boolean>(true);
  incidencia = signal<Incidencia | null>(null);

  ngOnInit() {
    const codigo = this.route.snapshot.paramMap.get('codigo');
    if (codigo) {
      this.cargarDetalle(codigo);
    } else {
      this.cargando.set(false);
    }
  }

  cargarDetalle(codigo: string) {
    this.cargando.set(true);
    this.incidenciaService.getIncidenciaPorCodigo(codigo).subscribe({
      next: (data) => {
        this.incidencia.set(data || null);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
      }
    });
  }

  /**
   * R1: Alternar seguimiento local para esta incidencia.
   */
  async toggleSeguimiento() {
    const item = this.incidencia();
    if (!item) return;

    const marcado = await this.seguimientoService.alternarSeguimiento(item.codigo);
    const toast = await this.toastCtrl.create({
      message: marcado
        ? `Agregado a seguimiento personal`
        : `Eliminado de seguimiento personal`,
      duration: 2000,
      position: 'bottom',
      color: marcado ? 'warning' : 'medium'
    });
    await toast.present();
  }

  esSeguimiento(): boolean {
    const item = this.incidencia();
    return item ? this.seguimientoService.estaMarcado(item.codigo) : false;
  }

  /**
   * R9: Transición de pendiente a "en proceso".
   */
  cambiarAEnProceso() {
    const item = this.incidencia();
    if (!item) return;

    this.incidenciaService.actualizarEstado(item.codigo, 'en proceso').subscribe({
      next: async (actualizada) => {
        this.incidencia.set({ ...actualizada });
        const toast = await this.toastCtrl.create({
          message: 'Estado cambiado a En Proceso',
          duration: 2500,
          color: 'primary',
          position: 'top'
        });
        await toast.present();
      },
      error: async (err) => {
        const alert = await this.alertCtrl.create({
          header: 'Error',
          message: err.message || 'No se pudo actualizar el estado.',
          buttons: ['Aceptar']
        });
        await alert.present();
      }
    });
  }

  /**
   * R9: Transición a "resuelta" con OBSERVACIÓN OBLIGATORIA.
   */
  async abrirDialogoResolver() {
    const item = this.incidencia();
    if (!item) return;

    const alert = await this.alertCtrl.create({
      header: 'Resolver Incidencia (R9)',
      subHeader: 'Registro de Solución',
      message: 'Para marcar la incidencia como resuelta, es obligatorio ingresar una observación detallada del trabajo realizado.',
      inputs: [
        {
          name: 'observacion',
          type: 'textarea',
          placeholder: 'Ej: Se realizó el bacheo asfáltico y compactación el 28 de octubre.'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar y Resolver',
          handler: (data) => {
            const observacion = data.observacion?.trim();
            // Regla R9: Observación es estrictamente obligatoria
            if (!observacion) {
              this.mostrarAlertaObservacionRequerida();
              return false; // Evita cerrar el diálogo
            }

            this.marcarComoResuelta(observacion);
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  async mostrarAlertaObservacionRequerida() {
    const alert = await this.alertCtrl.create({
      header: 'Observación Requerida (R9)',
      message: 'No puedes marcar una incidencia como resuelta sin ingresar una observación que justifique la solución.',
      buttons: ['Entendido']
    });
    await alert.present();
  }

  marcarComoResuelta(observacion: string) {
    const item = this.incidencia();
    if (!item) return;

    this.incidenciaService.actualizarEstado(item.codigo, 'resuelta', observacion).subscribe({
      next: async (actualizada) => {
        this.incidencia.set({ ...actualizada });
        const toast = await this.toastCtrl.create({
          message: '¡Incidencia marcada como Resuelta exitosamente!',
          duration: 3000,
          color: 'success',
          position: 'top'
        });
        await toast.present();
      },
      error: async (err) => {
        const alert = await this.alertCtrl.create({
          header: 'Transición No Permitida (R9)',
          message: err.message || 'Error al actualizar estado.',
          buttons: ['Aceptar']
        });
        await alert.present();
      }
    });
  }

  abrirMapa() {
    const item = this.incidencia();
    if (item?.latitud && item?.longitud) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${item.latitud},${item.longitud}`, '_blank');
    }
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
