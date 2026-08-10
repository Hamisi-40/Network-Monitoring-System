import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { IonButton, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkCircleOutline, logOutOutline, mailOutline, personOutline, shieldCheckmarkOutline } from 'ionicons/icons';
import { finalize } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { UiService } from '../../services/ui.service';

@Component({selector:'app-settings',standalone:true,imports:[IonButton,IonIcon,IonSpinner],templateUrl:'./settings.page.html',styleUrl:'./settings.page.scss',changeDetection:ChangeDetectionStrategy.OnPush})
export class SettingsPage{
 readonly auth=inject(AuthService);private readonly ui=inject(UiService);readonly loading=signal(false);readonly error=signal(false);
 readonly initials=computed(()=>this.auth.admin()?.name.split(' ').map(part=>part[0]).slice(0,2).join('').toUpperCase()||'AD');
 constructor(){addIcons({checkmarkCircleOutline,logOutOutline,mailOutline,personOutline,shieldCheckmarkOutline});if(!this.auth.admin())this.refresh();}
 refresh():void{this.loading.set(true);this.error.set(false);this.auth.loadCurrentAdmin().pipe(finalize(()=>this.loading.set(false))).subscribe({error:()=>this.error.set(true)});}
 async logout():Promise<void>{if(await this.ui.confirm('Log out?','Your current administrator session will end.','Log out'))this.auth.logout();}
}
