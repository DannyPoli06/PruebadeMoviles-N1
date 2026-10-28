import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonSelect,
  IonSelectOption,
  IonInput,
  IonTextarea,
  IonGrid,
  IonRow,
  IonCol,
  IonToggle,
  AlertController,
  ToastController
} from '@ionic/angular';
import { IncidenciaService } from '../../core/services/incidencia.service';
import { ClimaService } from '../../core/services/clima.service';
import { BorradorService } from '../../core/services/borrador.service';
import { PhotoService } from '../../core/services/photo.service';
import { LocationService } from '../../core/services/location.service';
import { DatosMeteorologicos } from '../../core/models/clima.model';

@Component({
  selector: 'app-incidencia-form',
  templateUrl: './incidencia-form.page.html',
  styleUrls: ['./incidencia-form.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonSelect,
    IonSelectOption,
    IonInput,
    IonTextarea,
    IonGrid,
    IonRow,
    IonCol,
    IonToggle
  ]
})
export class IncidenciaFormPage implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);

  private incidenciaService = inject(IncidenciaService);
  private climaService = inject(ClimaService);
  private borradorService = inject(BorradorService);
  private photoService = inject(PhotoService);
  private locationService = inject(LocationService);

  incidenciaForm!: FormGroup;

  // Estados reactivos
  fotoPreview = signal<string | null>(null);
  datosClima = signal<DatosMeteorologicos | null>(null);
  errorClima = signal<string | null>(null);
  obteniendoGPS = signal<boolean>(false);
  consultandoClima = signal<boolean>(false);
  guardando = signal<boolean>(false);

  // Auxiliar para demostración de defensa oral (Simular lluvia > 5mm)
  simularLluviaAlta = false;

  ngOnInit() {
    this.inicializarFormulario();
    this.verificarBorradorIncompleto();
  }

  inicializarFormulario() {
    this.incidenciaForm = this.fb.group({
      tipo: ['bache', [Validators.required]],
      prioridad: ['media', [Validators.required]],
      direccion: ['', [Validators.required]],
      sector: ['Norte', [Validators.required]],
      descripcion: ['', [Validators.required]],
      latitud: [null],
      longitud: [null]
    });

    // R8: Auto-guardar cambios para recuperación de borrador
    this.incidenciaForm.valueChanges.subscribe(val => {
      this.guardarEstadoBorrador();
    });
  }

  /**
   * R8: Verifica si existe un registro incompleto al entrar a la pantalla o reiniciar la app.
   */
  async verificarBorradorIncompleto() {
    const draft = await this.borradorService.obtenerBorrador();
    if (draft && (draft.descripcion || draft.direccion || draft.fotografia)) {
      const alert = await this.alertCtrl.create({
        header: 'Registro Incompleto (R8)',
        subHeader: 'Se detectaron datos no guardados',
        message: '¿Deseas continuar con el registro anterior o descartarlo para iniciar uno nuevo?',
        backdropDismiss: false,
        buttons: [
          {
            text: 'Descartar',
            role: 'destructive',
            handler: () => {
              this.borradorService.limpiarBorrador();
              this.limpiarFormulario();
            }
          },
          {
            text: 'Continuar registro',
            handler: () => {
              this.restaurarBorrador(draft);
            }
          }
        ]
      });
      await alert.present();
    }
  }

  restaurarBorrador(draft: any) {
    this.incidenciaForm.patchValue({
      tipo: draft.tipo || 'bache',
      prioridad: draft.prioridad || 'media',
      direccion: draft.direccion || '',
      sector: draft.sector || 'Norte',
      descripcion: draft.descripcion || '',
      latitud: draft.latitud || null,
      longitud: draft.longitud || null
    }, { emitEvent: false });

    if (draft.fotografia) {
      this.fotoPreview.set(draft.fotografia);
    }
    if (draft.temperatura !== undefined) {
      this.datosClima.set({
        temperatura: draft.temperatura,
        precipitacion: draft.precipitacion || 0,
        condicion: draft.condicionClima || 'Despejado',
        icono: 'cloudy-outline',
        alertaLluvia: (draft.precipitacion || 0) > 5.0
      });
    }
  }

  guardarEstadoBorrador() {
    const formVal = this.incidenciaForm.value;
    const borrador = {
      ...formVal,
      fotografia: this.fotoPreview() || undefined,
      temperatura: this.datosClima()?.temperatura,
      precipitacion: this.datosClima()?.precipitacion,
      condicionClima: this.datosClima()?.condicion
    };
    this.borradorService.guardarBorrador(borrador);
  }

  esBache(): boolean {
    return this.incidenciaForm.get('tipo')?.value === 'bache';
  }

  esPrioridadAlta(): boolean {
    return this.incidenciaForm.get('prioridad')?.value === 'alta';
  }

  onTipoChange() {
    this.guardarEstadoBorrador();
  }

  onPrioridadChange() {
    this.guardarEstadoBorrador();
  }

  onCoordenadasChange() {
    this.guardarEstadoBorrador();
  }

  /**
   * R7: Obtiene coordenadas actuales mediante Capacitor Geolocation.
   */
  async obtenerGPS() {
    this.obteniendoGPS.set(true);
    try {
      const coords = await this.locationService.obtenerPosicionActual();
      this.incidenciaForm.patchValue({
        latitud: coords.latitud,
        longitud: coords.longitud
      });
      this.obteniendoGPS.set(false);
      this.consultarClima(); // Consulta clima automáticamente con las coordenadas GPS
    } catch (err: any) {
      this.obteniendoGPS.set(false);
      const alert = await this.alertCtrl.create({
        header: 'Acceso a GPS (R7)',
        message: 'No se pudo obtener la posición por GPS. Puede ingresar las coordenadas manualmente en los campos correspondientes.',
        buttons: ['Entendido']
      });
      await alert.present();
    }
  }

  /**
   * R4: Consulta servicio meteorológico real Open-Meteo.
   */
  consultarClima() {
    let lat = Number(this.incidenciaForm.get('latitud')?.value);
    let lng = Number(this.incidenciaForm.get('longitud')?.value);

    // Coordenadas por defecto en Quito si no se han establecido
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      lat = -0.2298;
      lng = -78.5249;
      this.incidenciaForm.patchValue({ latitud: lat, longitud: lng });
    }

    this.consultandoClima.set(true);
    this.errorClima.set(null);

    this.climaService.consultarClima(lat, lng).subscribe({
      next: (datos) => {
        if (this.simularLluviaAlta) {
          datos.precipitacion = 7.8;
          datos.alertaLluvia = true;
          datos.condicion = 'Lluvia torrencial (Simulada para defensa)';
        }
        this.datosClima.set(datos);
        this.consultandoClima.set(false);
        this.guardarEstadoBorrador();
      },
      error: (msg) => {
        this.errorClima.set('No se pudo consultar el clima en tiempo real');
        this.consultandoClima.set(false);
      }
    });
  }

  toggleSimulacionLluvia(event: any) {
    this.simularLluviaAlta = event.detail.checked;
    if (this.datosClima()) {
      const actual = { ...this.datosClima()! };
      if (this.simularLluviaAlta) {
        actual.precipitacion = 8.2;
        actual.alertaLluvia = true;
        actual.condicion = 'Lluvia intensa (Simulada)';
      } else {
        actual.precipitacion = 0.5;
        actual.alertaLluvia = false;
        actual.condicion = 'Nublado';
      }
      this.datosClima.set(actual);
    } else {
      this.consultarClima();
    }
  }

  /**
   * R6: Captura de fotografía mediante Capacitor Camera.
   */
  async capturarFoto() {
    try {
      const fotoDataUrl = await this.photoService.tomarFoto();
      if (fotoDataUrl) {
        this.fotoPreview.set(fotoDataUrl);
        this.guardarEstadoBorrador();
      }
    } catch (err: any) {
      const alert = await this.alertCtrl.create({
        header: 'Permiso de Cámara (R6)',
        message: 'No se concedió el permiso para acceder a la cámara. Si la prioridad es Alta, la fotografía es un requisito obligatorio.',
        buttons: ['Aceptar']
      });
      await alert.present();
    }
  }

  quitarFoto() {
    this.fotoPreview.set(null);
    this.guardarEstadoBorrador();
  }

  limpiarFormulario() {
    this.incidenciaForm.reset({
      tipo: 'bache',
      prioridad: 'media',
      direccion: '',
      sector: 'Norte',
      descripcion: '',
      latitud: null,
      longitud: null
    });
    this.fotoPreview.set(null);
    this.datosClima.set(null);
    this.errorClima.set(null);
    this.borradorService.limpiarBorrador();
  }

  /**
   * R5: Validación y envío de la incidencia a la API de oficina.
   */
  async guardarIncidencia() {
    if (this.incidenciaForm.invalid) {
      const alert = await this.alertCtrl.create({
        header: 'Campos Incompletos',
        message: 'Por favor completa todos los campos requeridos marcados con (*).',
        buttons: ['Corregir']
      });
      await alert.present();
      return;
    }

    const val = this.incidenciaForm.value;

    // Validación R7: Bache exige coordenadas GPS o manuales válidas
    if (val.tipo === 'bache') {
      const lat = Number(val.latitud);
      const lng = Number(val.longitud);
      if (!this.locationService.validarCoordenadas(lat, lng)) {
        const alert = await this.alertCtrl.create({
          header: 'Ubicación Obligatoria (R7)',
          message: 'Para incidencias de tipo Bache es obligatorio obtener la posición por GPS o ingresar coordenadas manuales válidas (Latitud: -90 a 90, Longitud: -180 a 180).',
          buttons: ['Ingresar Coordenadas']
        });
        await alert.present();
        return;
      }
    }

    // Validación R5 y R6: Prioridad Alta exige fotografía
    if (val.prioridad === 'alta' && !this.fotoPreview()) {
      const alert = await this.alertCtrl.create({
        header: 'Evidencia Obligatoria (R5 y R6)',
        message: 'Para incidencias de prioridad Alta es indispensable capturar y adjuntar una fotografía como evidencia antes de enviar.',
        buttons: ['Tomar Fotografía']
      });
      await alert.present();
      return;
    }

    this.guardando.set(true);

    const nuevaIncidencia = {
      tipo: val.tipo,
      prioridad: val.prioridad,
      direccion: val.direccion,
      sector: val.sector,
      descripcion: val.descripcion,
      latitud: val.latitud ? Number(val.latitud) : undefined,
      longitud: val.longitud ? Number(val.longitud) : undefined,
      fotografia: this.fotoPreview() || undefined,
      temperatura: this.datosClima()?.temperatura,
      precipitacion: this.datosClima()?.precipitacion,
      condicionClima: this.datosClima()?.condicion
    };

    this.incidenciaService.crearIncidencia(nuevaIncidencia).subscribe({
      next: async (res) => {
        this.guardando.set(false);
        // R8: Registro guardado exitosamente, limpiar borrador
        await this.borradorService.limpiarBorrador();
        this.limpiarFormulario();

        const toast = await this.toastCtrl.create({
          message: `¡Incidencia ${res.codigo} registrada con éxito!`,
          duration: 3000,
          color: 'success',
          position: 'top'
        });
        await toast.present();

        this.router.navigate(['/tabs/incidencias']);
      },
      error: async (err) => {
        this.guardando.set(false);
        const alert = await this.alertCtrl.create({
          header: 'Error al Enviar',
          message: 'Ocurrió un problema al enviar la incidencia al servicio de oficina. Inténtalo nuevamente.',
          buttons: ['Aceptar']
        });
        await alert.present();
      }
    });
  }
}
