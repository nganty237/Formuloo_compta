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

  @Input() isCollapsed: boolean = false;
  @Output() toggleCollapse = new EventEmitter<void>();

  tenantId: string = '';

  ngOnInit() {
    // Récupérer l'ID de l'entreprise (nommé 'id' dans la route /tenant/:id)
    const urlId = this.route.snapshot.paramMap.get('id');
    if (urlId) {
      this.tenantId = urlId;
    } else {
      // Si on est sur une route enfant (ex: /tenant/ENT-001/dashboard), 
      // il faut parfois regarder le parent selon la structure
      const parentId = this.route.parent?.snapshot.paramMap.get('id');
      if (parentId) {
        this.tenantId = parentId;
      }
    }
  }

  onToggle() {
    this.toggleCollapse.emit();
  }
}
