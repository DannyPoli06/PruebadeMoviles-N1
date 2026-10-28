import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DatosMeteorologicos, OpenMeteoResponse } from '../models/clima.model';

@Injectable({
  providedIn: 'root'
})
export class ClimaService {
  private http = inject(HttpClient);

  /**
   * Consulta el servicio meteorológico real Open-Meteo usando latitud y longitud (R4).
   * Retorna temperatura, precipitación acumulada de la última hora y condición del tiempo.
   */
  consultarClima(latitud: number, longitud: number): Observable<DatosMeteorologicos> {
    const url = `${environment.openMeteoUrl}?latitude=${latitud}&longitude=${longitud}&current=temperature_2m,precipitation,weather_code`;

    return this.http.get<OpenMeteoResponse>(url).pipe(
      map(resp => {
        const current = resp.current;
        if (!current) {
          throw new Error('No se recibieron datos meteorológicos actuales.');
        }

        const temp = Math.round(current.temperature_2m * 10) / 10;
        const prec = Math.round(current.precipitation * 10) / 10;
        const { condicion, icono } = this.interpretarCodigoClima(current.weather_code);

        return {
          temperatura: temp,
          precipitacion: prec,
          condicion: condicion,
          icono: icono,
          // R4: Si la precipitación de la última hora supera 5 mm, advertir al inspector
          alertaLluvia: prec > 5.0
        };
      }),
      catchError(error => {
        console.error('Error al consultar el servicio meteorológico:', error);
        return throwError(() => new Error('No se pudo conectar con el servicio meteorológico en tiempo real.'));
      })
    );
  }

  /**
   * Traduce el código meteorológico WMO a una descripción comprensible en español e ícono de Ionic.
   */
  private interpretarCodigoClima(code: number): { condicion: string; icono: string } {
    if (code === 0) return { condicion: 'Despejado', icono: 'sunny-outline' };
    if (code >= 1 && code <= 3) return { condicion: 'Parcialmente Nublado', icono: 'cloudy-outline' };
    if (code >= 45 && code <= 48) return { condicion: 'Niebla / Neblina', icono: 'cloudy-outline' };
    if (code >= 51 && code <= 55) return { condicion: 'Llovizna ligera', icono: 'rainy-outline' };
    if (code >= 61 && code <= 65) return { condicion: 'Lluvia constante', icono: 'rainy-outline' };
    if (code >= 80 && code <= 82) return { condicion: 'Chubascos fuertes', icono: 'rainy-outline' };
    if (code >= 95) return { condicion: 'Tormenta eléctrica', icono: 'warning-outline' };
    return { condicion: 'Nublado', icono: 'cloudy-outline' };
  }
}
