import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VisitsComponent } from './components/visits/visits.component';
import { LoginComponent } from './components/login/login.component';
import { IsLogoutGuard } from './guards/is-logout.guard';
import { IsLoginGuard } from './guards/is-login.guard';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginComponent, canActivate: [IsLogoutGuard] },
  { path: 'visits', component: VisitsComponent, canActivate: [IsLoginGuard] },
  { path: '**', component: VisitsComponent, canActivate: [IsLoginGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
