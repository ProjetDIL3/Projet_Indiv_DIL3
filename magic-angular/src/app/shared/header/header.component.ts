import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { HeaderTitleService } from '../../core/utils/header-title.service';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, MatToolbarModule, MatButtonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {

  pageTitle: string = '';
  
  constructor(private headerTitleService: HeaderTitleService) {}
  
  ngOnInit(): void {
    this.headerTitleService.title$.subscribe(title => {
      this.pageTitle = title;
    });
  }
  
}