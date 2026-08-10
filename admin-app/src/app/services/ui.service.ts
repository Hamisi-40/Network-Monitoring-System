import { inject, Injectable } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular/standalone';

@Injectable({ providedIn: 'root' })
export class UiService {
  private readonly toastController = inject(ToastController);
  private readonly alertController = inject(AlertController);

  async toast(message: string, color: 'success' | 'danger' | 'warning' = 'success'): Promise<void> {
    const toast = await this.toastController.create({ message, color, duration: 2600, position: 'top' });
    await toast.present();
  }

  async confirm(header: string, message: string, actionLabel = 'Confirm'): Promise<boolean> {
    return new Promise(async resolve => {
      const alert = await this.alertController.create({
        header,
        message,
        buttons: [
          { text: 'Cancel', role: 'cancel', handler: () => resolve(false) },
          { text: actionLabel, role: 'confirm', handler: () => resolve(true) }
        ]
      });
      await alert.present();
      await alert.onDidDismiss().then(event => {
        if (event.role !== 'confirm' && event.role !== 'cancel') resolve(false);
      });
    });
  }
}
