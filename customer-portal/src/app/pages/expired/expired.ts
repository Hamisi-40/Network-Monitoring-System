import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SessionService } from '../../services/session.service';

@Component({
  selector: 'app-expired-page',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './expired.html',
  styleUrl: './expired.css',
})
export class ExpiredPageComponent {
  constructor(readonly sessionService: SessionService) {}
}

