import { Component, TemplateRef, inject } from '@angular/core';
import { Storage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from '@angular/fire/storage';
import { Firestore, collection, collectionData, doc, addDoc, CollectionReference, DocumentReference, setDoc } from '@angular/fire/firestore';
import { Observable, Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { ApiService } from 'src/app/services/api.service';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { AngularDeviceInformationService } from 'angular-device-information';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { WebcamImage, WebcamInitError, WebcamUtil } from 'ngx-webcam';

@Component({
  selector: 'app-visits',
  templateUrl: './visits.component.html',
  styleUrls: ['./visits.component.css']
})
export class VisitsComponent {
  // toggle webcam on/off
  public showWebcam = true;
  public allowCameraSwitch = false;
  public multipleWebcamsAvailable = false;
  public facingMode: string = 'environment';

  // latest snapshot
  public webcamImage: WebcamImage | any;

  // webcam snapshot trigger
  private trigger: Subject<void> = new Subject<void>();

  private storage: Storage = inject(Storage);
  private firestore: Firestore = inject(Firestore);

  uploadedImage: any

  visitsCollection: any

  getDeviceType: any
  getDeviceInfoOs: any
  getDeviceInfoOsVersion: any
  getDeviceInfoBrowser: any
  getDeviceInfoBrowserVersion: any
  getDeviceInfoScreen_resolution: any
  getDeviceInfoUserAgent: any
  latitude: any
  longitude: any
  zoom: any
  address: any;

  currentAdded: any = []
  userData: any

  date: any
  time: any
  constructor(public datepipe: DatePipe, private router: Router, private apiService: ApiService, private modalService: NgbModal, private deviceInformationService: AngularDeviceInformationService, private http: HttpClient) {
    this.getUserOwenVisits()
    this.getCurrentDeviceData()
    this.getDateTime()
    this.getUserData();
  }

  ngOnInit(): void {
    this.readAvailableVideoInputs();
  }

  public triggerSnapshot(): void {
    this.trigger.next();
  }

  public handleInitError(error: WebcamInitError): void {
    if (error.mediaStreamError && error.mediaStreamError.name === 'NotAllowedError') {
    }
  }

  public handleImage(webcamImage: WebcamImage): void {
    this.webcamImage = webcamImage;
    this.uploadedImage = webcamImage.imageAsDataUrl
    this.uploadFile(webcamImage)
  }

  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  public get videoOptions(): MediaTrackConstraints {
    const result: MediaTrackConstraints = {};
    if (this.facingMode && this.facingMode !== '') {
      result.facingMode = { ideal: this.facingMode };
    }
    return result;
  }

  private readAvailableVideoInputs() {
    WebcamUtil.getAvailableVideoInputs()
      .then((mediaDevices: MediaDeviceInfo[]) => {
        this.multipleWebcamsAvailable = mediaDevices && mediaDevices.length > 1;
      });
  }

  getUserOwenVisits() {
    if (localStorage.getItem('owenVisits')) {
      this.currentAdded = JSON.parse(localStorage.getItem('owenVisits') || '{}')
    }
  }

  getUserData() {
    if (localStorage.getItem('userData')) {
      this.userData = JSON.parse(localStorage.getItem('userData') || '{}')
    }
  }

  getDateTime() {
    this.date = new Date().toDateString();
    this.time = new Date().getHours() + ':' + new Date().getMinutes();
  }

  startUpload: any
  uploadFile(image: any) {

    this.startUpload = true
    this.uploadedImage = null
    if (!image) {
      this.startUpload = false
      return;
    }
    if (this.latitude && this.longitude) {
      const file: any = this.DataURIToBlob(image?.imageAsDataUrl)
      const formData = new FormData();
      formData.append('upload', file, 'image.jpg')

      // const files: FileList = input.files;
      // for (let i = 0; i < files.length; i++) {
      //   const file = files.item(i);

      if (file) {
        const storageRef = ref(this.storage, 'images/' + this.generateName(10));
        uploadBytesResumable(storageRef, file).then(res => {
          getDownloadURL(res.ref).then((res) => {
            this.uploadedImage = res;
            this.startUpload = false
          });
        });
      }
      // }
    } else {
      Swal.fire({
        title: 'Add Visit Error',
        text: 'You must allow your location to add new visit!',
        icon: 'error'
      })
      this.startUpload = false
    }
  }

  DataURIToBlob(dataURI: string) {
    const splitDataURI = dataURI.split(',')
    const byteString = splitDataURI[0].indexOf('base64') >= 0 ? atob(splitDataURI[1]) : decodeURI(splitDataURI[1])
    const mimeString = splitDataURI[0].split(':')[1].split(';')[0]

    const ia = new Uint8Array(byteString.length)
    for (let i = 0; i < byteString.length; i++)
      ia[i] = byteString.charCodeAt(i)

    return new Blob([ia], { type: mimeString })
  }

  startAdding: any
  addVisit(data: any) {
    this.startAdding = true
    this.visitsCollection = collection(this.firestore, 'visits')


    if (!data) {
      this.startAdding = false
      return;
    }

    if (this.latitude && this.longitude) {
      let Data = {
        ...data,
        adress: this.address,
        date: this.date,
        image: this.uploadedImage,
        lat: this.latitude,
        lon: this.longitude,
        time: this.time,
        userId: this.userData?.userId,
        visitId: this.generate(13)
      }


      addDoc(this.visitsCollection, Data).then((res: any) => {
        this.currentAdded.push(Data)
        localStorage.setItem('owenVisits', JSON.stringify(this.currentAdded))
        Swal.fire({
          title: 'visit added succesfully!',
          icon: 'success'
        })
        this.webcamImage = null
        this.uploadedImage = null
        this.startAdding = false
        this.modalService.dismissAll();
      }).catch((err) => {
        Swal.fire({
          title: 'visit added failed, please try again!',
          icon: 'error'
        })
        this.startAdding = false
        this.webcamImage = null
        this.uploadedImage = null
        this.modalService.dismissAll();
      });
    } else {
      Swal.fire({
        title: 'Add Visit Error',
        text: 'You must allow your location to add new visit!',
        icon: 'error'
      })
      this.startAdding = false
    }
  }

  generate(n: any): any {
    var add = 1, max = 12 - add;   // 12 is the min safe number Math.random() can generate without it starting to pad the end with zeros.

    if (n > max) {
      return this.generate(max) + this.generate(n - max);
    }

    max = Math.pow(10, n + add);
    var min = max / 10; // Math.pow(10, n) basically
    var number = Math.floor(Math.random() * (max - min + 1)) + min;

    return ("" + number).substring(add);
  }

  generateName(length: any) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result.toString() + '.jpg';
  }

  closeResult = '';
  selectedItem: any
  open(content: TemplateRef<any>, item?: any) {
    this.selectedItem = item
    this.modalService.open(content, { size: 'lg', centered: true }).result.then(
      (result: any) => {
        this.closeResult = `Closed with: ${result}`;
        this.selectedItem = ''
      },
      (reason: any) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        this.selectedItem = ''
      },
    );
  }

  private getDismissReason(reason: any): string {
    this.selectedItem = ''
    switch (reason) {
      case ModalDismissReasons.ESC:
        return 'by pressing ESC';
      case ModalDismissReasons.BACKDROP_CLICK:
        return 'by clicking on a backdrop';
      default:
        return `with: ${reason}`;
    }

  }

  getLocation() {
    navigator.geolocation.getCurrentPosition((position) => {
      this.latitude = position.coords.latitude;
      this.longitude = position.coords.longitude;
      this.zoom = 16;
      this.getAddress(this.latitude, this.longitude)
    });
  }

  getAddress(lat: any, lon: any) {
    this.http.get(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}4&lon=${lon}`).subscribe((data: any) => {
      this.address = data?.display_name
    });
  }

  getCurrentDeviceData() {
    this.getDeviceType = this.deviceInformationService.getDeviceType()
    this.getDeviceInfoOs = this.deviceInformationService.getDeviceInfo().os
    this.getDeviceInfoOsVersion = this.deviceInformationService.getDeviceInfo().osVersion
    this.getDeviceInfoBrowser = this.deviceInformationService.getDeviceInfo().browser
    this.getDeviceInfoBrowserVersion = this.deviceInformationService.getDeviceInfo().browserVersion
    this.getDeviceInfoScreen_resolution = this.deviceInformationService.getDeviceInfo().screen_resolution
    this.getDeviceInfoUserAgent = this.deviceInformationService.getDeviceInfo().userAgent
  }


  exportElmToExcel(): void {
    const edata = [];
    const udt = {
      data: [
        { A: "Visits Details" }, // title
        {
          A: "Image",
          B: "Sales Person",
          C: "Customer Name",
          D: "Date ",
          E: "Time",
          F: "Address",
          G: "Description",
        },
      ],
      skipHeader: true,
    };
    this.currentAdded.forEach((data: any) => {
      udt.data.push({
        A: data?.image ? data?.image : '----',
        B: data?.username ? data?.username : '----',
        C: data?.customer_name ? data?.customer_name : '----',
        D: data?.date ? this.datepipe.transform(data?.date, 'dd-MM-yyyy')?.toString() : '----',
        E: data?.time ? data?.time : '----',
        F: data?.adress ? data?.adress : '----',
        G: data?.visit_description ? data?.visit_description : '----'
      });
    });
    edata.push(udt);

    const DateObj = new Date();
    const dateNow =
      DateObj.getFullYear() +
      "-" +
      ("0" + (DateObj.getMonth() + 1)).slice(-2) +
      "-" +
      ("0" + DateObj.getDate()).slice(-2);
    this.apiService.exportJsonToExcel(edata, "visits_details_" + dateNow);
  }

  // // Create a reference to the file to delete
  // const desertRef = ref(storage, 'images/desert.jpg');
  // // Delete the file
  // deleteObject(desertRef).then(() => {
  //   // File deleted successfully
  // }).catch ((error) => {
  //   // Uh-oh, an error occurred!
  // });
}
