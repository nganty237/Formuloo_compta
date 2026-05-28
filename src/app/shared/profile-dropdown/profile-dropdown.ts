import { Component, ElementRef, HostListener, Output, EventEmitter, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonComponent } from '../components/button/button';

@Component({
  selector: 'app-profile-dropdown',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent],
  templateUrl: './profile-dropdown.html',
})
export class ProfileDropdownComponent {
  username = input<string>('Anicet Nganty');
  role = input<string>('Comptable Principal');
  initials = input<string>('AN');
  @Output() logout = new EventEmitter<void>();
  @Output() closeMenu = new EventEmitter<void>();

  constructor(private elementRef: ElementRef) {}

  // Déclenche la déconnexion
  onLogout(): void {
    this.logout.emit();
  }

  // Ferme le menu si on clique n'importe où en dehors du composant
  @HostListener('document:click', ['$event'])
  clickOutside(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeMenu.emit();
    }
  }
}
