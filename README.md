# UrbanInspect · Inspección de Infraestructura Urbana
**Escuela Politécnica Nacional | ESFOT**  
**Asignatura:** Desarrollo de Aplicaciones Móviles  
**Tecnología:** Ionic + Angular Standalone + Capacitor + TypeScript  

---

## 1. Descripción del Proyecto
 La app ermite consultar, registrar y dar seguimiento en campo a incidencias de infraestructura urbana (luminarias dañadas, baches, señalización, alcantarillas obstruidas y daños en parques), incorporando evidencia fotográfica persistente, geolocalización GPS, consulta meteorológica en tiempo real y persistencia local para casos de seguimiento y borradores interrumpidos.

---

## 2. Instrucciones de Ejecución

### Prerrequisitos
- **Node.js** (v18 o superior) y **npm**.
- **Android Studio** y SDK de Android (para compilar el APK).
- **Ionic* (opcional para desarrollo web: `npm i -g @ionic/cli`).

### Ejecución en Entorno de Desarrollo (Navegador)
Dentro de la carpeta `prueba/`:
```bash
# 1. Instalar dependencias (si es primera vez)
npm install

# 2. Iniciar servidor local de desarrollo
npm start
# o alternativamente:
# npx ionic serve
```
La aplicación se abrirá en `http://localhost:4200` o `http://localhost:8100`.

### Compilación y Generación del APK Android
```bash
# 1. Compilar los assets web
ionic build

# 2. Sincronizar plugins y assets con el proyecto nativo Android
ionic capacitor sync android

# 3. Abrir en Android Studio para ejecutar en emulador o generar APK firmado:
ionic capcitor open android
```

---

## 3. Justificación de Decisiones Técnicas

| Requisito / Componente | Decisión Técnica | Justificación para la Defensa |
| :--- | :--- | :--- |
| **Framework Base** | **Ionic 9 + Angular Standalone** | Componentes limpios con `standalone: true`, eliminando la sobrecarga de `NgModule`, mejorando la velocidad de arranque y facilitando la modularidad del código para un estudiante de primer semestre. |
| **Acceso a Hardware** | **Capacitor 8 Plugins** | Estándar oficial moderno de Ionic. Se emplearon `@capacitor/camera` para captura y preview fotográfico, `@capacitor/geolocation` para coordenadas GPS y `@capacitor/preferences` para almacenamiento persistente en el dispositivo. |
| **API Meteorológica (R4)** | **Open-Meteo API** | Servicio real, público y gratuito. **No requiere API Key**, eliminando el riesgo de claves expiradas o cobros inesperados durante la defensa. Entrega temperatura actual y precipitación acumulada por hora en milímetros (`precipitation`). |
| **Simulación de Oficina (R2, R3, R5, R9)** | **MockAPI / REST Service** | Soporta paginación remota incremental mediante parámetros `?page=X&limit=5`. Se incluye un repositorio de respaldo resiliente con 16 casos iniciales representativos de Quito para garantizar que la app funcione incluso si el aula de examen no cuenta con conexión a internet. |
| **Persistencia de Fotos (R6)** | **Capacitor DataURL** | Almacenamiento en formato base64 DataURL completo. Cumple con la condición de la rúbrica: *"La fotografía debe permanecer accesible desde el detalle una vez guardado el registro; no basta con guardar una ruta temporal del dispositivo en la API"*. |
| **Seguimiento Local (R1)** | **@capacitor/preferences** | Almacena los códigos marcados exclusivamente en el almacenamiento interno de la app (SharedPreferences en Android). No se envían a la oficina, garantizando privacidad local. |
| **Recuperación de Borrador (R8)** | **Auto-guardado reactivo** | Los cambios del formulario se sincronizan en almacenamiento local. Si la app se cierra o el inspector sale, un diálogo ofrece continuar o descartar los datos. |

---
