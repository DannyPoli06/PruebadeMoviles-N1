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
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonList,
  IonItem,
  IonThumbnail,
  IonLabel,
  IonBadge,
  IonSkeletonText
} from '@ionic/angular';
import { IncidenciaService } from '../../core/services/incidencia.service';
import { Incidencia, EstadoIncidencia } from '../../core/models/incidencia.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
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
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardContent,
    IonList,
    IonItem,
    IonThumbnail,
    IonLabel,
    IonBadge,
    IonSkeletonText
  ]
})
export class DashboardPage implements OnInit {
  private incidenciaService = inject(IncidenciaService);
  private router = inject(Router);

  cargando = signal<boolean>(true);
  total = signal<number>(0);
  totalPendientes = signal<number>(0);
  totalEnProceso = signal<number>(0);
  totalResueltas = signal<number>(0);
  totalAlta = signal<number>(0);
  recientes = signal<Incidencia[]>([]);

  ngOnInit() {
    this.cargarDatos();
  }

  ionViewWillEnter() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.cargando.set(true);
    this.incidenciaService.getTodasIncidencias().subscribe({
      next: (data) => {
        this.total.set(data.length);
        this.totalPendientes.set(data.filter(i => i.estado === 'pendiente').length);
        this.totalEnProceso.set(data.filter(i => i.estado === 'en proceso').length);
        this.totalResueltas.set(data.filter(i => i.estado === 'resuelta').length);
        this.totalAlta.set(data.filter(i => i.prioridad === 'alta').length);
        this.recientes.set(data.slice(0, 4));
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
      }
    });
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
