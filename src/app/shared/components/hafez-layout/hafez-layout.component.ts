import { Component, computed, inject, OnInit } from '@angular/core';

import { SideBarService } from '../../services/side-bar.service';

@Component({
  selector: 'app-hafez-layout',
  standalone: false,
  templateUrl: './hafez-layout.component.html',
  styleUrl: './hafez-layout.component.scss',
})
export class HafezLayoutComponent implements OnInit {
  private readonly sideBarService: SideBarService = inject(SideBarService);

  isVisible = computed<boolean>(() => this.sideBarService.isVisible);

  ngOnInit(): void {}
}
