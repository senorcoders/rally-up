import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { ProfilePage } from '../profile/profile';
import { FeedPage } from '../feed/feed'
import { PopoverController } from 'ionic-angular';
import { OverlayPage } from '../overlay/overlay'
import { UsersProvider } from '../../providers/users/users';
import { Device } from '@ionic-native/device';


@Component({
  selector: 'page-alerts',
  templateUrl: 'alerts.html'
})

export class AlertsPage {

  endpoint:any = 'ux_events';
  myRallyID:any;
  alerts:any;

  constructor(
    public navCtrl: NavController,
    public alertCtrl: AlertController, 
    public popoverCtrl: PopoverController,
    private httpProvider:UsersProvider,
    public device: Device) {
      this.httpProvider.returnRallyUserId().then(user => {
          this.myRallyID = user.apiRallyID;
          this.getData();
      });

  }
  goToProfile() {
 
    this.navCtrl.setRoot(ProfilePage);
  }


  goToHome(){
  	this.navCtrl.setRoot(FeedPage);
  }

   presentPopover() {
       let popover = this.popoverCtrl.create(OverlayPage);
       popover.present();
     }

     getData(){
      this.httpProvider.getJsonData(this.endpoint + '?user_id=' + this.myRallyID + '&device_id='+ this.device.uuid).subscribe(
        result => {
          this.alerts=result;
        },
        err =>{
          console.error("Error : "+err);
        } ,
        () => {
          console.log('getData completed');
        }
      );
     }
 

        
}