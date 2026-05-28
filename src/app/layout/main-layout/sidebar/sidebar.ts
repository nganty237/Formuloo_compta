import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, ActivatedRoute } from '@angular/router';
import { HasRoleDirective } from '../../../shared/directives/has-role.directive';
import { ButtonComponent } from '../../../shared/components/button/button';
import { IconComponent } from '../../../shared/components/icon/icon';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, HasRoleDirective, ButtonComponent, IconComponent],
  templateUrl: './sidebar.html',
  styles: ``,
})
export class Sidebar implements OnInit {
  private route = inject(ActivatedRoute);

  @Input() isCollapsed = false;
  @Output() toggleCollapse = new EventEmitter<void>();

  tenantId = 'tenant-123';

  ngOnInit() {
    const urlTenantId = this.route.parent?.snapshot.paramMap.get('id');
    if (urlTenantId) {
      this.tenantId = urlTenantId;
    }
  }

  onToggle() {
    this.toggleCollapse.emit();
  }
}
