// Modelo de respuesta para la consulta meteorológica (Open-Meteo) (R4)
export interface DatosMeteorologicos {
  temperatura: number;       // En grados Celsius
  precipitacion: number;     // En mm acumulados en la última hora
  condicion: string;         // Descripción legible (ej: Lluvioso, Nublado, Despejado)
  icono: string;             // Nombre del icono Ionic
  alertaLluvia: boolean;     // True si precipitacion > 5 mm
}

// Interfaz para la respuesta cruda de Open-Meteo API
export interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  current?: {
    time: string;
    temperature_2m: number;
    precipitation: number;
    weather_code: number;
  };
}
