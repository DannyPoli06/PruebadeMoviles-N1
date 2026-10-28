// Modelo de Incidencia urbana según requisitos de la ESFOT
export type TipoIncidencia = 'bache' | 'luminaria' | 'senalizacion' | 'alcantarilla' | 'parque' | 'otro';
export type PrioridadIncidencia = 'baja' | 'media' | 'alta';
export type EstadoIncidencia = 'pendiente' | 'en proceso' | 'resuelta';

export interface Incidencia {
  id?: string;
  codigo: string;              // Ej: INC-101 (R2)
  tipo: TipoIncidencia;        // Tipo de problema (R2, R5)
  descripcion: string;         // Detalle del daño (R2, R5)
  direccion: string;           // Dirección o referencia (R2, R5)
  sector: string;              // Sector de Quito: Norte, Centro, Sur, Valles (R2, R5)
  prioridad: PrioridadIncidencia; // baja, media, alta (R5)
  fecha: string;               // Fecha de registro ISO (R2)
  estado: EstadoIncidencia;    // pendiente, en proceso, resuelta (R2, R9)
  fotografia?: string;         // URL o DataURL permanente de la foto (R2, R6)
  latitud?: number;            // Coordenada latitud (R7)
  longitud?: number;           // Coordenada longitud (R7)
  observacion?: string;        // Observación obligatoria al resolverse (R9)
  temperatura?: number;        // Datos meteorológicos consultados (R4)
  precipitacion?: number;      // Precipitación última hora en mm (R4)
  condicionClima?: string;     // Condición (despejado, lluvia, etc.) (R4)
}
