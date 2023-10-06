import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ScanScreenComponent} from '../app/views/scan-screen/scan-screen.component';
import { PrivacyPolicyComponent } from './views/privacy-policy/privacy-policy.component';

const routes: Routes = [
  {path:'scanScreen',component: ScanScreenComponent},
  {path:'privacyPolicy',component:PrivacyPolicyComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
