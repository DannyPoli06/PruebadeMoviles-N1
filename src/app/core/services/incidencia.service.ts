import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Incidencia, EstadoIncidencia } from '../models/incidencia.model';

@Injectable({
  providedIn: 'root'
})
export class IncidenciaService {
  private http = inject(HttpClient);

  // Semilla de prueba con 16 incidencias para Quito (al menos 3 páginas de resultados, 3 estados, varios tipos)
  // Cumple el requisito de prueba: "demostrar al menos tres páginas de resultados, los tres estados y varios tipos/prioridades"
  private mockIncidencias: Incidencia[] = [
    {
      id: '1',
      codigo: 'INC-1001',
      tipo: 'bache',
      descripcion: 'Bache profundo en carril derecho frente a la parada de bus.',
      direccion: 'Av. América y Mariana de Jesús',
      sector: 'Norte',
      prioridad: 'alta',
      fecha: '2026-10-25T08:30:00Z',
      estado: 'pendiente',
      fotografia: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=500&auto=format&fit=crop&q=60',
      latitud: -0.1912,
      longitud: -78.4981,
      temperatura: 16.2,
      precipitacion: 1.2,
      condicionClima: 'Nublado'
    },
    {
      id: '2',
      codigo: 'INC-1002',
      tipo: 'luminaria',
      descripcion: 'Poste con luminaria intermitente y cable expuesto.',
      direccion: 'Calle Guayaquil y Chile, Plaza Grande',
      sector: 'Centro',
      prioridad: 'media',
      fecha: '2026-10-25T11:15:00Z',
      estado: 'en proceso',
      fotografia: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=60',
      latitud: -0.2205,
      longitud: -78.5117,
      temperatura: 18.0,
      precipitacion: 0.0,
      condicionClima: 'Despejado'
    },
    {
      id: '3',
      codigo: 'INC-1003',
      tipo: 'alcantarilla',
      descripcion: 'Rejilla de alcantarilla rota y desprendida, peligro para peatones.',
      direccion: 'Av. Rodrigo de Chávez y 5 de Junio',
      sector: 'Sur',
      prioridad: 'alta',
      fecha: '2026-10-24T14:40:00Z',
      estado: 'resuelta',
      fotografia: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f9?w=500&auto=format&fit=crop&q=60',
      latitud: -0.2384,
      longitud: -78.5202,
      observacion: 'Se sustituyó la rejilla por una de hierro reforzado el 25 de octubre.',
      temperatura: 17.5,
      precipitacion: 0.2,
      condicionClima: 'Parcialmente Nublado'
    },
    {
      id: '4',
      codigo: 'INC-1004',
      tipo: 'parque',
      descripcion: 'Juegos infantiles oxidados con bordes filosos.',
      direccion: 'Parque La Carolina, cerca a pista de patinaje',
      sector: 'Norte',
      prioridad: 'baja',
      fecha: '2026-10-24T16:00:00Z',
      estado: 'pendiente',
      fotografia: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=500&auto=format&fit=crop&q=60',
      latitud: -0.1818,
      longitud: -78.4842,
      temperatura: 15.8,
      precipitacion: 6.4,
      condicionClima: 'Lluvia constante'
    },
    {
      id: '5',
      codigo: 'INC-1005',
      tipo: 'senalizacion',
      descripcion: 'Señal de Pare derribada por colisión vehicular.',
      direccion: 'Av. República y Eloy Alfaro',
      sector: 'Norte',
      prioridad: 'media',
      fecha: '2026-10-23T09:20:00Z',
      estado: 'en proceso',
      fotografia: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500&auto=format&fit=crop&q=60',
      latitud: -0.1856,
      longitud: -78.4801,
      temperatura: 16.5,
      precipitacion: 0.0,
      condicionClima: 'Despejado'
    },
    {
      id: '6',
      codigo: 'INC-1006',
      tipo: 'bache',
      descripcion: 'Hundimiento de calzada de 1 metro de diámetro.',
      direccion: 'Av. Maldonado y El Sena',
      sector: 'Sur',
      prioridad: 'alta',
      fecha: '2026-10-23T15:30:00Z',
      estado: 'pendiente',
      fotografia: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=500&auto=format&fit=crop&q=60',
      latitud: -0.2312,
      longitud: -78.5144,
      temperatura: 14.1,
      precipitacion: 3.1,
      condicionClima: 'Llovizna ligera'
    },
    {
      id: '7',
      codigo: 'INC-1007',
      tipo: 'luminaria',
      descripcion: 'Luminaria apagada en paso peatonal subterráneo.',
      direccion: 'Av. 10 de Agosto y Colón',
      sector: 'Centro',
      prioridad: 'alta',
      fecha: '2026-10-22T19:00:00Z',
      estado: 'resuelta',
      fotografia: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=60',
      latitud: -0.2014,
      longitud: -78.4947,
      observacion: 'Circuito eléctrico reconfigurado y bombilla reemplazada.',
      temperatura: 13.9,
      precipitacion: 0.0,
      condicionClima: 'Despejado'
    },
    {
      id: '8',
      codigo: 'INC-1008',
      tipo: 'alcantarilla',
      descripcion: 'Alcantarilla tapada con escombros que desborda agua lluvia.',
      direccion: 'Av. Ilaló y San Pedro',
      sector: 'Valles',
      prioridad: 'media',
      fecha: '2026-10-22T10:10:00Z',
      estado: 'pendiente',
      fotografia: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f9?w=500&auto=format&fit=crop&q=60',
      latitud: -0.2981,
      longitud: -78.4412,
      temperatura: 19.3,
      precipitacion: 7.8,
      condicionClima: 'Chubascos fuertes'
    },
    {
      id: '9',
      codigo: 'INC-1009',
      tipo: 'parque',
      descripcion: 'Árbol caído sobre caminería del parque tras tormenta.',
      direccion: 'Parque El Ejido, acceso norte',
      sector: 'Centro',
      prioridad: 'alta',
      fecha: '2026-10-21T07:45:00Z',
      estado: 'en proceso',
      fotografia: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=500&auto=format&fit=crop&q=60',
      latitud: -0.2119,
      longitud: -78.4988,
      temperatura: 15.0,
      precipitacion: 0.5,
      condicionClima: 'Nublado'
    },
    {
      id: '10',
      codigo: 'INC-1010',
      tipo: 'bache',
      descripcion: 'Fisuras múltiples y bache superficial en curva.',
      direccion: 'Av. Simón Bolívar, sector Guápulo',
      sector: 'Norte',
      prioridad: 'baja',
      fecha: '2026-10-20T12:00:00Z',
      estado: 'resuelta',
      fotografia: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=500&auto=format&fit=crop&q=60',
      latitud: -0.2031,
      longitud: -78.4729,
      observacion: 'Bacheo asfáltico aplicado y compactado con éxito.',
      temperatura: 17.8,
      precipitacion: 0.0,
      condicionClima: 'Despejado'
    },
    {
      id: '11',
      codigo: 'INC-1011',
      tipo: 'senalizacion',
      descripcion: 'Semáforo peatonal no cambia a luz verde.',
      direccion: 'Av. Patria y 12 de Octubre',
      sector: 'Centro',
      prioridad: 'alta',
      fecha: '2026-10-19T13:25:00Z',
      estado: 'pendiente',
      fotografia: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500&auto=format&fit=crop&q=60',
      latitud: -0.2093,
      longitud: -78.4921,
      temperatura: 16.0,
      precipitacion: 0.0,
      condicionClima: 'Parcialmente Nublado'
    },
    {
      id: '12',
      codigo: 'INC-1012',
      tipo: 'luminaria',
      descripcion: 'Dos postes sin energía en calle secundaria poco transitada.',
      direccion: 'Calle De los Rosales y Nogales',
      sector: 'Norte',
      prioridad: 'baja',
      fecha: '2026-10-18T20:10:00Z',
      estado: 'en proceso',
      fotografia: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=60',
      latitud: -0.1542,
      longitud: -78.4763,
      temperatura: 12.5,
      precipitacion: 0.0,
      condicionClima: 'Despejado'
    },
    {
      id: '13',
      codigo: 'INC-1013',
      tipo: 'alcantarilla',
      descripcion: 'Falta tapa circular de pozo de revisión en la vereda.',
      direccion: 'Av. Mariscal Sucre y Morán Valverde',
      sector: 'Sur',
      prioridad: 'alta',
      fecha: '2026-10-17T09:00:00Z',
      estado: 'pendiente',
      fotografia: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f9?w=500&auto=format&fit=crop&q=60',
      latitud: -0.2855,
      longitud: -78.5482,
      temperatura: 15.2,
      precipitacion: 2.0,
      condicionClima: 'Nublado'
    },
    {
      id: '14',
      codigo: 'INC-1014',
      tipo: 'parque',
      descripcion: 'Cerca perimetral de cancha deportiva rota.',
      direccion: 'Parque Los Algarrobos, Cumbayá',
      sector: 'Valles',
      prioridad: 'baja',
      fecha: '2026-10-16T16:45:00Z',
      estado: 'resuelta',
      fotografia: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=500&auto=format&fit=crop&q=60',
      latitud: -0.2011,
      longitud: -78.4328,
      observacion: 'Malla metálica reinstalada y reforzada con postes nuevos.',
      temperatura: 21.0,
      precipitacion: 0.0,
      condicionClima: 'Despejado'
    },
    {
      id: '15',
      codigo: 'INC-1015',
      tipo: 'bache',
      descripcion: 'Serie de baches causados por filtración de agua potable.',
      direccion: 'Calle De las Universidades y Veintimilla',
      sector: 'Centro',
      prioridad: 'media',
      fecha: '2026-10-15T11:00:00Z',
      estado: 'en proceso',
      fotografia: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=500&auto=format&fit=crop&q=60',
      latitud: -0.2054,
      longitud: -78.4932,
      temperatura: 16.8,
      precipitacion: 0.0,
      condicionClima: 'Parcialmente Nublado'
    },
    {
      id: '16',
      codigo: 'INC-1016',
      tipo: 'otro',
      descripcion: 'Acumulación de ramas y basura tras poda en acera pública.',
      direccion: 'Av. Amazonas y Gaspar de Villarroel',
      sector: 'Norte',
      prioridad: 'baja',
      fecha: '2026-10-14T08:15:00Z',
      estado: 'pendiente',
      fotografia: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=500&auto=format&fit=crop&q=60',
      latitud: -0.1689,
      longitud: -78.4795,
      temperatura: 14.7,
      precipitacion: 0.0,
      condicionClima: 'Despejado'
    }
  ];

  /**
   * Consulta incidencias con paginación remota (R2 y R3).
   * Envía ?page=X&limit=Y a la API REST.
   * Si la API remota no está activa, utiliza la colección local de respaldo.
   */
  getIncidenciasPaginadas(page: number, limit: number = 5): Observable<Incidencia[]> {
    const url = `${environment.apiUrl}?page=${page}&limit=${limit}`;

    return this.http.get<Incidencia[]>(url).pipe(
      catchError((err: HttpErrorResponse) => {
        // En caso de que MockAPI no esté disponible o estemos en defensa local/offline:
        console.warn('API remota no disponible, usando repositorio simulado con paginación:', err.message);
        const inicio = (page - 1) * limit;
        const fin = inicio + limit;
        const sublista = this.mockIncidencias.slice(inicio, fin);
        return of(sublista);
      })
    );
  }

  /**
   * Obtiene todas las incidencias (útil para indicadores del Dashboard R10).
   */
  getTodasIncidencias(): Observable<Incidencia[]> {
    return this.http.get<Incidencia[]>(environment.apiUrl).pipe(
      catchError(() => of(this.mockIncidencias))
    );
  }

  /**
   * Obtiene una incidencia por su código o id (R2).
   */
  getIncidenciaPorCodigo(codigo: string): Observable<Incidencia | undefined> {
    const encontrada = this.mockIncidencias.find(i => i.codigo === codigo || i.id === codigo);
    if (encontrada) {
      return of(encontrada);
    }
    return this.http.get<Incidencia[]>(`${environment.apiUrl}?codigo=${codigo}`).pipe(
      map(res => res.length ? res[0] : undefined),
      catchError(() => of(undefined))
    );
  }

  /**
   * Registra una nueva incidencia en la API remota (R5).
   */
  crearIncidencia(incidencia: Partial<Incidencia>): Observable<Incidencia> {
    // Generar código correlativo si no viene
    const nuevoCodigo = `INC-${1000 + this.mockIncidencias.length + 1}`;
    const nueva: Incidencia = {
      id: `${Date.now()}`,
      codigo: incidencia.codigo || nuevoCodigo,
      tipo: incidencia.tipo || 'otro',
      descripcion: incidencia.descripcion || '',
      direccion: incidencia.direccion || '',
      sector: incidencia.sector || 'Norte',
      prioridad: incidencia.prioridad || 'media',
      fecha: new Date().toISOString(),
      estado: 'pendiente', // Por defecto inicia como pendiente
      fotografia: incidencia.fotografia || '',
      latitud: incidencia.latitud,
      longitud: incidencia.longitud,
      temperatura: incidencia.temperatura,
      precipitacion: incidencia.precipitacion,
      condicionClima: incidencia.condicionClima
    };

    return this.http.post<Incidencia>(environment.apiUrl, nueva).pipe(
      map(res => {
        this.mockIncidencias.unshift(res);
        return res;
      }),
      catchError(() => {
        // En caso de que MockAPI falle o no esté creado el recurso
        this.mockIncidencias.unshift(nueva);
        return of(nueva);
      })
    );
  }

  /**
   * Actualiza el estado y observación de una incidencia cumpliendo las reglas de negocio (R9).
   * Transiciones válidas:
   *  pendiente -> en proceso
   *  pendiente -> resuelta (exige observacion)
   *  en proceso -> resuelta (exige observacion)
   *  resuelta -> NO se puede revertir
   */
  actualizarEstado(idOcodigo: string, nuevoEstado: EstadoIncidencia, observacion?: string): Observable<Incidencia> {
    const item = this.mockIncidencias.find(i => i.id === idOcodigo || i.codigo === idOcodigo);
    
    if (!item) {
      return throwError(() => new Error('Incidencia no encontrada.'));
    }

    // Regla R9: Una incidencia resuelta no puede regresar a pendiente ni a en proceso
    if (item.estado === 'resuelta') {
      return throwError(() => new Error('Una incidencia resuelta no puede modificarse ni cambiar de estado.'));
    }

    // Regla R9: Para marcarla como resuelta, es obligatorio ingresar una observación
    if (nuevoEstado === 'resuelta' && (!observacion || !observacion.trim())) {
      return throwError(() => new Error('Para marcar una incidencia como resuelta, es obligatorio ingresar una observación.'));
    }

    // Aplicar cambio
    item.estado = nuevoEstado;
    if (observacion) {
      item.observacion = observacion.trim();
    }

    const url = `${environment.apiUrl}/${item.id}`;
    return this.http.put<Incidencia>(url, item).pipe(
      map(res => item),
      catchError(() => {
        // Si MockAPI falla, mantenemos el cambio en memoria
        return of(item);
      })
    );
  }
}
