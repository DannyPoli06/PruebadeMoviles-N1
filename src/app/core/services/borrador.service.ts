import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { Incidencia } from '../models/incidencia.model';

const DRAFT_KEY = 'urbaninspect_formulario_borrador';

@Injectable({
  providedIn: 'root'
})
export class BorradorService {

  /**
   * Guarda automáticamente los datos que el usuario va ingresando en el formulario (R8).
   */
  async guardarBorrador(datos: Partial<Incidencia>): Promise<void> {
    try {
      await Preferences.set({
        key: DRAFT_KEY,
        value: JSON.stringify(datos)
      });
    } catch (e) {
      console.warn('Error al guardar borrador de incidencia:', e);
    }
  }

  /**
   * Obtiene el borrador almacenado si existe.
   */
  async obtenerBorrador(): Promise<Partial<Incidencia> | null> {
    try {
      const { value } = await Preferences.get({ key: DRAFT_KEY });
      if (value) {
        return JSON.parse(value) as Partial<Incidencia>;
      }
      return null;
    } catch (e) {
      console.warn('Error al leer borrador:', e);
      return null;
    }
  }

  /**
   * Elimina el borrador cuando el registro es guardado con éxito o el usuario decide descartarlo.
   */
  async limpiarBorrador(): Promise<void> {
    try {
      await Preferences.remove({ key: DRAFT_KEY });
    } catch (e) {
      console.warn('Error al limpiar borrador:', e);
    }
  }
}
