import { Component, inject } from '@angular/core';
import { Firestore, collectionData, collection, Timestamp, doc, getDocs, query, where, getDocsFromServer, QueryConstraint, addDoc } from '@angular/fire/firestore';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent {
  dashboard_users: Observable<any[]> | any;
  firestore: Firestore = inject(Firestore);

  loginForm: FormGroup | any;
  username: FormControl | any;
  password: FormControl | any;

  subscription: Subscription = new Subscription()
  subscription2: Subscription = new Subscription()

  logging: boolean = false

  users: any
  constructor(private fb: FormBuilder, private apiService: ApiService, private router: Router) {
    this.getDashboardUsers()
  }

  ngOnInit(): void {
    this.initForm();
  }

  sub!: Subscription;
  getDashboardUsers() {
    const itemCollection = collection(this.firestore, 'dashboard_users');
    this.dashboard_users = collectionData(itemCollection);
    this.sub = this.dashboard_users.subscribe((res: any) => {
      this.users = res
      this.sub.unsubscribe()
    })
  }

  initForm() {
    this.loginForm = this.fb.group({
      username: new FormControl('', [Validators.required, Validators.minLength(4),]),
      password: new FormControl('', [Validators.required, Validators.minLength(4), Validators.maxLength(32)]),
    })
  }

  get LoginFormControls() {
    return this.loginForm.controls
  }

  login() {
    if (this.loginForm.valid) {
      let userData: any = ''
      let ref = collection(this.firestore, 'users')
      let wa: QueryConstraint[] = [
        where('username', '==', this.loginForm.controls.username.value),
        where('password', '==', this.loginForm.controls.password.value)]

      const refq = query(ref, ...wa)

      let ref2 = collection(this.firestore, 'allawed_users')
      let wa2: QueryConstraint[];
      let refq2: any;

      this.subscription = collectionData(refq).subscribe((res: any) => {
        if (res?.length) {
          // check Allowed Or Not
          wa2 = [where('userId', '==', res[0].userId)]
          refq2 = query(ref2, ...wa2)
          this.subscription2 = collectionData(refq2).subscribe((res: any) => {
            if (res?.length) {
              userData = { username: res[0]?.username, userId: res[0]?.userId };
              localStorage.setItem('userData', JSON.stringify(userData))

              Swal.fire({
                title: 'Login',
                text: 'User Login Successfully!',
                icon: 'success'
              }).then(() => {
                this.router.navigate(['/visits'])
              })
            } else {
              Swal.fire({
                title: 'Login',
                text: 'User Name Or Password Is Wrong , Or You Are Not Allowed To Login!',
                icon: 'error'
              })
            }
            this.subscription2.unsubscribe()
          })
          this.subscription.unsubscribe()
        } else {
          Swal.fire({
            title: 'Login',
            text: 'User Name Or Password Is Wrong , Or You Are Not Allowed To Login!',
            icon: 'error'
          })
        }
      })
    } else {
      Swal.fire({
        title: 'Login',
        text: 'User Name Or Password Is Wrong',
        icon: 'error'
      })
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe()
    this.subscription2.unsubscribe()
  }
}
