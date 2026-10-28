# UrbanInspect · Inspección de Infraestructura Urbana
**Escuela Politécnica Nacional | ESFOT**  
**Asignatura:** Desarrollo de Aplicaciones Móviles  
**Tecnología:** Ionic + Angular Standalone + Capacitor + TypeScript  

---

## 1. Descripción del Proyecto
UrbanInspect es una solución móvil diseñada para inspectores del Distrito Metropolitano de Quito (DMQ). Permite consultar, registrar y dar seguimiento en campo a incidencias de infraestructura urbana (luminarias dañadas, baches, señalización, alcantarillas obstruidas y daños en parques), incorporando evidencia fotográfica persistente, geolocalización GPS, consulta meteorológica en tiempo real y persistencia local para casos de seguimiento y borradores interrumpidos.

---

## 2. Instrucciones de Ejecución

### Prerrequisitos
- **Node.js** (v18 o superior) y **npm**.
- **Android Studio** y SDK de Android (para compilar el APK).
- **Ionic CLI** (opcional para desarrollo web: `npm i -g @ionic/cli`).

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
npm run build

# 2. Sincronizar plugins y assets con el proyecto nativo Android
npx cap sync android

# 3. Abrir en Android Studio para ejecutar en emulador o generar APK firmado:
npx cap open android

# O compilar directamente el APK Debug por línea de comandos:
cd android
./gradlew assembleDebug
# El APK generado se ubicará en:
# android/app/build/outputs/apk/debug/app-debug.apk
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

## 4. Guía Rápida para los Casos de Prueba de la Defensa Oral

Durante la defensa de 10 minutos, el docente evaluará los siguientes puntos de la rúbrica (16 puntos):

1. **Seguimiento Local (R1 - 0.8 pts):**
   - En la pestaña *Incidencias*, toca el icono de marcador (bookmark) en dos incidencias distintas.
   - Ve a la pestaña *Seguimiento*; constata que ambas aparecen.
   - Cierra o recarga la aplicación. Vuelve a *Seguimiento*; constata que persisten.
   - Presiona el botón "Quitar"; la incidencia desaparece de la vista local sin enviar ninguna petición a la API de oficina.
2. **Consulta Meteorológica y Lluvia > 5 mm (R4 - 0.8 pts):**
   - En la pestaña *Registrar*, presiona "Obtener Coordenadas GPS" o "Consultar Clima".
   - Observa la temperatura, precipitación en mm y condición.
   - Activa el interruptor *"Simular lluvia > 5mm (Para prueba de defensa)"*; verifica que se despliega inmediatamente el banner de advertencia climática para mantenimiento sin bloquear el formulario.
3. **Validación de Prioridad Alta sin Foto (R5 y R6 - 3.2 pts):**
   - En el formulario, selecciona Prioridad: **Alta**.
   - No tomes fotografía e intenta presionar "Registrar Incidencia".
   - Comprueba que la aplicación bloquea el envío y muestra una alerta explicando que para prioridad alta la evidencia fotográfica es obligatoria.
4. **Validación de Bache con GPS Denegado (R7 - 1.2 pts):**
   - Selecciona Tipo: **Bache**.
   - Borra los campos de Latitud y Longitud.
   - Presiona "Registrar Incidencia"; la app impedirá guardar exigiendo coordenadas válidas (GPS o manuales).
   - Ingresa coordenadas válidas de Quito (ej. Latitud: `-0.2298`, Longitud: `-78.5249`) y presiona "Consultar Clima"; verifica que se usan para obtener el tiempo.
5. **Recuperación de Borrador Incompleto (R8 - 1.2 pts):**
   - En el formulario, escribe una dirección y descripción de prueba.
   - Sal del formulario o recarga el navegador/app.
   - Al volver a la pestaña *Registrar*, aparecerá el diálogo de recuperación: presiona **"Continuar registro"** y verifica que los datos escritos se restauraron intactos.
6. **Reglas de Transición de Estado y Observación Obligatoria (R9 - 1.6 pts):**
   - Abre el detalle de una incidencia en estado **Pendiente**.
   - Presiona "Iniciar Proceso"; el estado cambia a **En Proceso**.
   - Presiona "Marcar como Resuelta"; se abrirá un cuadro exigiendo una observación de solución. Si se intenta confirmar vacío, el sistema lo impide.
   - Ingresa la observación (ej. "Se cambió el asfalto") y confirma.
   - Una vez en **Resuelta**, comprueba que los botones desaparecen y se bloquea cualquier regreso a pendiente o en proceso.
7. **Paginación Remota y Dashboard (R2, R3, R10 - 4.0 pts):**
   - En *Inicio*, constata los contadores y métricas en tiempo real.
   - En *Incidencias*, baja haciendo scroll; observa cómo el `ion-infinite-scroll` descarga de 5 en 5 los registros remotos hasta agotarse, momento en el cual se deshabilita la paginación.
