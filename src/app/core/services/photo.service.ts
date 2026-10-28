import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {

  /**
   * Captura una fotografía utilizando Capacitor Camera (R6).
   * Usa DataUrl para que la imagen se almacene de forma íntegra y persistente,
   * evitando que se pierda tras reiniciar el dispositivo o cerrar la app.
   */
  async tomarFoto(): Promise<string | null> {
    try {
      const image = await Camera.getPhoto({
        quality: 60,
        width: 800,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt, // Permite elegir entre Cámara o Galería
        promptLabelHeader: 'Evidencia Fotográfica',
        promptLabelPhoto: 'Elegir de Galería',
        promptLabelPicture: 'Tomar Fotografía',
        promptLabelCancel: 'Cancelar'
      });

      return image.dataUrl || null;
    } catch (error: any) {
      // Si el usuario canceló la captura, no se considera error crítico
      if (error?.message?.includes('User cancelled') || error?.message?.includes('cancelled')) {
        return null;
      }
      console.warn('Error en captura fotográfica:', error);
      throw error;
    }
  }
}
