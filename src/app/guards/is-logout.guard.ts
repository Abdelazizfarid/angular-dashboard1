import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { ApiService } from '../services/api.service';

@Injectable({
  providedIn: 'root'
})
export class IsLogoutGuard implements CanActivate {
  constructor(
    private router: Router,
    //  private toast: ToastrService,
    private apiService: ApiService) { }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (!this.apiService.isLogin()) {
      return true;
    } else {
      // this.toast.warning('لقد قمت بتسجيل الدخول بالفعل')
      this.router.navigate(['/groups'])
      return false;
    }
  }

}
