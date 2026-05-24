import { Component, OnInit, inject } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.html',
})
export class HeaderComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  tenants = [
    { id: '123', name: 'Cabinet Expert & Co' },
    { id: '456', name: 'Cabinet Alpha Conseil' },
    { id: '789', name: 'Cabinet Horizon Compta' }
  ];

  selectedTenantId = '123';

  ngOnInit() {
    const urlTenantId = this.route.parent?.snapshot.paramMap.get('id');
    if (urlTenantId) {
      this.selectedTenantId = urlTenantId;
    }
  }

  onTenantChange(newTenantId: string) {
    this.selectedTenantId = newTenantId;
    this.router.navigate(['/tenant', newTenantId, 'dashboard']);
  }
}
