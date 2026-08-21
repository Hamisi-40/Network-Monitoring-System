import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IonButton, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBackOutline, pauseCircleOutline, playCircleOutline, wifiOutline } from 'ionicons/icons';
import { finalize } from 'rxjs';
import { InternetSession } from '../../models/session.model';
import { SessionService } from '../../services/session.service';
import { UiService } from '../../services/ui.service';

@Component({selector:'app-session-details',standalone:true,imports:[DatePipe,RouterLink,IonButton,IonIcon,IonSpinner],templateUrl:'./session-details.page.html',styleUrl:'./session-details.page.scss',changeDetection:ChangeDetectionStrategy.OnPush})
export class SessionDetailsPage{
 private readonly route=inject(ActivatedRoute);private readonly service=inject(SessionService);private readonly ui=inject(UiService);readonly session=signal<InternetSession|null>(null);readonly loading=signal(true);readonly error=signal(false);
 constructor(){addIcons({arrowBackOutline,pauseCircleOutline,playCircleOutline,wifiOutline});const id=Number(this.route.snapshot.paramMap.get('id'));if(Number.isFinite(id))this.load(id);else{this.loading.set(false);this.error.set(true);}}
 load(id:number):void{this.loading.set(true);this.service.getSession(id).pipe(finalize(()=>this.loading.set(false))).subscribe({next:r=>this.session.set(r.session),error:()=>this.error.set(true)});}
 async changeStatus():Promise<void>{const item=this.session();if(!item)return;const next=item.status==='suspended'?'active':'suspended';const confirmed=await this.ui.confirm(next==='active'?'Reactivate session?':'Suspend session?',`This updates access state for ${item.phone_number}.`,next==='active'?'Reactivate':'Suspend');if(!confirmed)return;this.service.changeStatus(item.id,next).subscribe({next:async()=>{this.session.update(s=>s?{...s,status:next}:s);await this.ui.toast(`Session ${next==='active'?'reactivated':'suspended'}.`);},error:()=>this.ui.toast('Session status could not be changed.','danger')});}
 money(value:number|string):string{return `TZS ${Number(value).toLocaleString('en-TZ')}`;}
}
