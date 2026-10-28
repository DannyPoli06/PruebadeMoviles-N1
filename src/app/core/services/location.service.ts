import { Injectable } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';

export interface Coordenadas {
  latitud: number;
  longitud: number;
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  /**
   * Obtiene la posición actual por GPS del dispositivo (R7).
   */
  async obtenerPosicionActual(): Promise<Coordenadas> {
    try {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000
      });

      return {
        latitud: Math.round(position.coords.latitude * 10000) / 10000,
        longitud: Math.round(position.coords.longitude * 10000) / 10000
      };
    } catch (error: any) {
      console.warn('Error al obtener geolocalización:', error);
      throw new Error('No se pudo acceder al GPS o el permiso fue denegado.');
    }
  }

  /**
   * Valida si un par de coordenadas manuales son válidas en el planeta.
   * Latitud: -90 a 90, Longitud: -180 a 180.
   */
  validarCoordenadas(lat: number, lng: number): boolean {
    if (isNaN(lat) || isNaN(lng)) return false;
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  }
}
