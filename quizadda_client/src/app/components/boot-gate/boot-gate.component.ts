import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BootStatus, ServerStatusService } from 'src/app/services/server-status.service';

/**
 * Full-screen splash shown when the backend is taking too long to respond to
 * its initial health probe. Renders nothing once the boot status reaches
 * {@code ready} — the rest of the app shell takes over.
 */
@Component({
  selector: 'app-boot-gate',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './boot-gate.component.html',
  styleUrls: ['./boot-gate.component.css']
})
export class BootGateComponent {

  private readonly serverStatus = inject(ServerStatusService);
  private readonly destroyRef = inject(DestroyRef);

  status: BootStatus = 'pending-fast';

  ngOnInit(): void {
    this.serverStatus.bootStatus$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(s => (this.status = s));
  }
}
