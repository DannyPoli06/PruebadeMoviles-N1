import { Injectable, signal } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

const STORAGE_KEY = 'urbaninspect_seguimiento_codigos';

@Injectable({
  providedIn: 'root'
})
export class SeguimientoService {
  // Lista reactiva de códigos marcados para seguimiento local
  codigosMarcados = signal<string[]>([]);

  constructor() {
    this.cargarSeguimiento();
  }

  /**
   * Carga la lista de códigos marcados desde el almacenamiento local persistente (R1).
   */
  async cargarSeguimiento(): Promise<string[]> {
    try {
      const { value } = await Preferences.get({ key: STORAGE_KEY });
      const codigos: string[] = value ? JSON.parse(value) : [];
      this.codigosMarcados.set(codigos);
      return codigos;
    } catch (e) {
      console.warn('Error al cargar seguimiento local:', e);
      return [];
    }
  }

  /**
   * Verifica si un código de incidencia está marcado para seguimiento.
   */
  estaMarcado(codigo: string): boolean {
    return this.codigosMarcados().includes(codigo);
  }

  /**
   * Alterna el estado de seguimiento (marcar o desmarcar) sin alterar la API remota.
   * Retorna true si quedó marcado, false si fue desmarcado.
   */
  async alternarSeguimiento(codigo: string): Promise<boolean> {
    const actuales = [...this.codigosMarcados()];
    const index = actuales.indexOf(codigo);
    let marcado = false;

    if (index >= 0) {
      // Desmarcar
      actuales.splice(index, 1);
      marcado = false;
    } else {
      // Marcar
      actuales.push(codigo);
      marcado = true;
    }

    this.codigosMarcados.set(actuales);
    await Preferences.set({
      key: STORAGE_KEY,
      value: JSON.stringify(actuales)
    });

    return marcado;
  }
}
