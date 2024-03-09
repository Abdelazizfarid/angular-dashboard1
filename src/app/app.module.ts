import { NgModule } from '@angular/core';

import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';


import { DatePipe } from '@angular/common';

import { AgmCoreModule } from '@agm/core';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getStorage, provideStorage } from '@angular/fire/storage';

import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { environment } from 'src/environments/environment.prod';
import { LoadingComponent } from './components/loading/loading.component';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { Select2Module } from 'ng-select2-component';
import { HttpClientModule } from '@angular/common/http';
import { AngularDeviceInformationService } from 'angular-device-information';
import { LoginComponent } from './components/login/login.component';
import { VisitsComponent } from './components/visits/visits.component';
import { WebcamModule } from 'ngx-webcam';

@NgModule({
  declarations: [
    AppComponent,
    LoadingComponent,
    LoginComponent,
    VisitsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    HttpClientModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
    ReactiveFormsModule,
    FormsModule,
    LeafletModule,
    Select2Module,
    AgmCoreModule.forRoot({
      apiKey: ''
    }),
    WebcamModule
  ],
  providers: [DatePipe, AngularDeviceInformationService],
  bootstrap: [AppComponent],
})
export class AppModule { }

