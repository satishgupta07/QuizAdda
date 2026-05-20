import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgxUiLoaderModule } from 'ngx-ui-loader';
import { BootGateComponent } from './components/boot-gate/boot-gate.component';
import { FooterComponent } from './components/footer/footer.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SlowServerBannerComponent } from './components/slow-server-banner/slow-server-banner.component';
import { ServerStatusService } from './services/server-status.service';
import { ThemeService } from './services/theme.service';

/**
 * Top-level app shell: sticky navbar above a router outlet, with the footer
 * pinned at the bottom of the viewport. The {@link ThemeService} is eagerly
 * injected here so the {@code dark-mode} class is applied to {@code <body>}
 * before any page paints — preventing a light-mode flash for dark-mode users.
 *
 * Also kicks off the {@link ServerStatusService} warm-up ping so the BootGate
 * can decide whether to show the cold-start splash.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    NgxUiLoaderModule,
    BootGateComponent,
    NavbarComponent,
    FooterComponent,
    SlowServerBannerComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  readonly title = 'Quiz Adda';

  constructor() {
    inject(ThemeService);
    // Probe the backend on startup so the BootGate can show the splash if
    // Render's dyno is cold. The service ignores success/error here — it
    // only cares about response timing.
    inject(ServerStatusService).warmUp();
  }
}
