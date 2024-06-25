import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ViewChild,
} from '@angular/core';
import { SecurityService } from 'src/app/core/services/security.service';
import { AppUserAuth } from 'src/app/models/login';
import { RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements AfterViewInit {
  menuColapsado: boolean = true;
  @ViewChild('rlUsuarios') rlUsuarios: RouterLinkActive | undefined;
 
  dataObject!: AppUserAuth | null;

  constructor(
    private securityService: SecurityService,
    private cdr: ChangeDetectorRef
  ) {
    localStorage.getItem('dataObject') && this.setDataUser();
  }

  setDataUser() {
    this.dataObject = this.securityService.getDataUser();
  }

  ngAfterViewInit() {
    this.cdr.detectChanges(); // forzar un ciclo de detección de cambios después de la vista inicial
  }

  cerrarMenu(): void {
    const sidebarMenu = document.querySelector('#sidebar-menu');

    if (sidebarMenu) {
      sidebarMenu.classList.remove('show');
    }
  }
}
