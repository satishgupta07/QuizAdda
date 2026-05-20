import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ServerStatusService } from 'src/app/services/server-status.service';

/**
 * Floating top-of-screen pill shown whenever an in-flight request is taking
 * longer than 3 seconds. Disappears as soon as the last slow request completes.
 */
@Component({
  selector: 'app-slow-server-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './slow-server-banner.component.html',
  styleUrls: ['./slow-server-banner.component.css']
})
export class SlowServerBannerComponent {

  private readonly serverStatus = inject(ServerStatusService);
  private readonly destroyRef = inject(DestroyRef);

  isSlow = false;

  ngOnInit(): void {
    this.serverStatus.isSlow$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(v => (this.isSlow = v));
  }
}
