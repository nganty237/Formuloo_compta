import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../../shared/components/icon/icon';

@Component({
  selector: 'app-accounting-home',
  standalone: true,
  imports: [RouterLink, IconComponent],
  templateUrl: './accounting-home.html',
  styles: ``,
})
export class AccountingHomeComponent { }
