import { Directive, Input, TemplateRef, ViewContainerRef, inject, OnInit, OnDestroy } from '@angular/core';
import { AuthService, UserRole } from '@core';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[appHasRole]',
  standalone: true
})
export class HasRoleDirective implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);
  
  private sub?: Subscription;
  private allowedRoles: UserRole[] = [];

  // Reçoit une chaîne ou un tableau de rôles: *appHasRole="['ADMIN', 'COMPTABLE']"
  @Input() set appHasRole(roles: UserRole | UserRole[]) {
    this.allowedRoles = Array.isArray(roles) ? roles : [roles];
    this.updateView();
  }

  ngOnInit() {
    this.sub = this.authService.currentUser$.subscribe(() => {
      this.updateView();
    });
  }

  private updateView() {
    if (this.authService.hasRole(this.allowedRoles)) {
      if (this.viewContainer.length === 0) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      }
    } else {
      this.viewContainer.clear();
    }
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}