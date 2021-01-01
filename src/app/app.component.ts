import { Component, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { faSignInAlt } from '@fortawesome/free-solid-svg-icons';
import { faBars } from '@fortawesome/free-solid-svg-icons';

// Import the AuthService type from the SDK
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Sermons For Preaching';
  faSignInAlt = faSignInAlt;
  faBars = faBars;
  menuOpen: boolean = false;

  constructor(public auth: AuthService, @Inject(DOCUMENT) public document: Document) {}

  toggleDrawer() {
    this.menuOpen = !this.menuOpen;
  }
}
