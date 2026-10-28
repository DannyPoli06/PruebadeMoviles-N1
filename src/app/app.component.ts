import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  homeOutline,
  listOutline,
  bookmarkOutline,
  bookmark,
  addCircleOutline,
  checkmarkCircle,
  alertCircle,
  timeOutline,
  time,
  locationOutline,
  cameraOutline,
  cloudyOutline,
  rainyOutline,
  sunnyOutline,
  warningOutline,
  trashOutline,
  refreshOutline,
  arrowBackOutline,
  createOutline,
  eyeOutline,
  navigateOutline,
  shieldCheckmarkOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor() {
    addIcons({
      homeOutline,
      listOutline,
      bookmarkOutline,
      bookmark,
      addCircleOutline,
      checkmarkCircle,
      alertCircle,
      timeOutline,
      time,
      locationOutline,
      cameraOutline,
      cloudyOutline,
      rainyOutline,
      sunnyOutline,
      warningOutline,
      trashOutline,
      refreshOutline,
      arrowBackOutline,
      createOutline,
      eyeOutline,
      navigateOutline,
      shieldCheckmarkOutline,
    });
  }
}
