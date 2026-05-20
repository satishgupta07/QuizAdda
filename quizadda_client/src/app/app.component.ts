import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgxUiLoaderModule } from 'ngx-ui-loader';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { ThemeService } from './services/theme.service';

/**
 * Top-level app shell: sticky navbar above a router outlet, with the footer
 * pinned at the bottom of the viewport. The {@link ThemeService} is eagerly
 * injected here so the {@code dark-mode} class is applied to {@code <body>}
 * before any page paints — preventing a light-mode flash for dark-mode users.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgxUiLoaderModule, NavbarComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  readonly title = 'Quiz Adda';

  constructor() {
    inject(ThemeService);
  }
}
