import { AuthService, ConfigStateService, ReplaceableComponentsService } from '@abp/ng.core';
import { AbpUserProfileService, eThemeLeptonXComponents } from '@abp/ng.theme.lepton-x';
import { Component, inject } from '@angular/core';
import { HafezLayoutComponent } from './shared/components/hafez-layout/hafez-layout.component';
import { ProfileService } from '@abp/ng.account.core/proxy';
import { LoginComponent } from './auth/login/login.component';
@Component({
  standalone: false,
  selector: 'app-root',
  template: `
    <abp-loader-bar></abp-loader-bar>
    <abp-dynamic-layout></abp-dynamic-layout>
    <p-toast>
  `,
})
export class AppComponent {

   replaceableComponent = inject(ReplaceableComponentsService);
   service = inject(ProfileService);
   auth = inject(AuthService);
  ngOnInit(): void {
    this.auth.getAccessToken();
    this.replaceableComponent.add({
      key: eThemeLeptonXComponents.ApplicationLayout,
      component : HafezLayoutComponent
    });
    this.replaceableComponent.add({
      key : eThemeLeptonXComponents.AccountLayout,
      component : LoginComponent
    })
  }
}
