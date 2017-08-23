import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { AlertsPage } from '../alerts/alerts'
import { ProfilePage } from '../profile/profile'
import { PopoverController } from 'ionic-angular';
import { OverlayPage } from '../overlay/overlay'

/**
 * Generated class for the EditProfilePage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-edit-profile',
  templateUrl: 'edit-profile.html',
})
export class EditProfilePage {

  constructor(public navCtrl: NavController, public navParams: NavParams, public alertCtrl: AlertController, public popoverCtrl: PopoverController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EditProfilePage');
  }

  goToOtherPage() {
    
       this.navCtrl.push(AlertsPage);
     }
   
      goToProfile() {
    
       this.navCtrl.push(ProfilePage);
     }
   
      presentPopover() {
       let popover = this.popoverCtrl.create(OverlayPage);
       popover.present();
     }

}