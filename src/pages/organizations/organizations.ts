import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, ActionSheetController, ToastController, ModalController} from 'ionic-angular';
import { FeedPage } from '../feed/feed';
import { AlertsPage } from '../alerts/alerts';
import { ProfilePage } from '../profile/profile';
import { PopoverController } from 'ionic-angular';
import { OverlayPage } from '../overlay/overlay';
import { OrganizationsProvider } from '../../providers/organizations/organizations';
import { OrganizationProfilePage } from '../organization-profile/organization-profile';
import { UsersProvider } from '../../providers/users/users';
import { PhotoViewer } from '@ionic-native/photo-viewer';
import { SocialShareProvider } from '../../providers/social-share/social-share';
import { OrganizationActionPage } from '../organization-action/organization-action';
import { EventDetailPage } from '../event-detail/event-detail';
import { FilterEventsPage } from '../filter-events/filter-events';
import { Storage } from '@ionic/storage';


@IonicPage() 
@Component({
  selector: 'page-organizations',
  templateUrl: 'organizations.html',
})
export class OrganizationsPage {
  organizations: any;
  endpoint:string = 'my_organizations/';
  myApiRallyID:any;
 favEndpoint:any = 'actions';
   hide_enpoint:any = 'hide_objective';
  likeAction:any ='1e006561-8691-4052-bef8-35cc2dcbd54e';
  goalLike:any = 'ea9bd95e-128c-4a38-8edd-938330ad8b2d';
  likeendpoint:any = 'likes';
  shareAction:any = '875b4997-f4e0-4014-a808-2403e0cf24f0';
  disable:boolean = false;
  organizationEndpoint:any = 'following_organizations';
  events:any;
  eventStart:any;
  eventEnd:any;
  eventFiltered:boolean = false;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public popoverCtrl: PopoverController,
    private httpProvider:OrganizationsProvider,
    private rallyProvider:UsersProvider,
    public viewCtrl:ViewController,
    public actionSheetCtrl: ActionSheetController,
    private shareProvider:SocialShareProvider,
    public toastCtrl: ToastController,
    private photoViewer: PhotoViewer,
    public modalCtrl: ModalController,
    private storage: Storage) {
    this.rallyProvider.returnRallyUserId()
      .then(user => {
        console.log(user);
        this.myApiRallyID = user.apiRallyID;
        this.getdata();
 
      });

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad OrganizationsPage');
  }

  ionViewWillEnter(){
   
    this.viewCtrl.setBackButtonText("My Feeds");
  }

  
  
 goToHome(){
    this.navCtrl.setRoot(FeedPage);
  }

  goToAlerts(){
    this.navCtrl.setRoot(AlertsPage);
  }

  goToProfile(){
    this.navCtrl.setRoot(ProfilePage);
  }

  presentPopover() {
       let popover = this.popoverCtrl.create(OverlayPage);
       popover.present();
     }

     getdata(startDate?, endDate?){

      if(startDate != null){
        var url = this.endpoint + this.myApiRallyID + '/' + startDate + '/' + endDate;
        this.eventFiltered = true;
      } else{
        var url = this.endpoint + this.myApiRallyID;
      }
  this.httpProvider.getJsonData(url).subscribe(
    result => {
      this.organizations=result['My_Organizations'];
      this.events = result['My_Events'];
      console.log("Success : "+ result['My_Organizations']);
    },
    err =>{
      console.error("Error : "+err);
    } ,
    () => {
      console.log('getData completed');
    }
  );
}


 goToOrganizationProfile(organizationID){
       this.navCtrl.push(OrganizationProfilePage, {
          organizationID: organizationID,
          OrgPageName: "My Organizations"
    });
     }

     goToActionPage(objectiveID){
       this.navCtrl.push(OrganizationActionPage, {
          objectiveID: objectiveID,
          pageName: 'My Organizations'
    }, {animate:true,animation:'transition',duration:500,direction:'forward'});
     }

       


 presentToast(message) {
      let toast = this.toastCtrl.create({
        message: message,
        duration: 3000
      });
      toast.present();
    }



  

    hideItem(objective_id, index){
        this.rallyProvider.hideObjective(this.hide_enpoint, this.myApiRallyID, objective_id);
        (this.organizations).splice(index, 1);
    }


     findInLoop(actions){
      if (actions != null){
        var found = actions.some(el => { 
          console.log(el);
            return el == this.myApiRallyID;
          
        });
        
        if (!found){
          return '#f2f2f2';
          
        }else{
          return '#296fb7';
          
        }
      }
   
  }




removeFav(recordID){
  this.rallyProvider.removeItem(this.likeendpoint, recordID).subscribe(res => {
    console.log(res);
    this.disable = false;

  }, err =>{
    console.log(err);
  });
  this.rallyProvider.removeFollowRecordID(recordID, 'favorites');
}

showPhotoViewer(path){
  this.photoViewer.show(path);
}


getLikeStatus($event, reference_id, like_type){
  this.disable = true;
  this.httpProvider.getJsonData(this.likeendpoint+'?reference_id='+reference_id+'&user_id='+this.myApiRallyID).subscribe(
    result => {
      console.log("Aqui", result);
      
      if(result != "" ){
        this.removeFav(result[0].id);
        this.presentToast('You unliked it');
        $event.srcElement.style.backgroundColor = '#f2f2f2';
        $event.srcElement.offsetParent.style.backgroundColor = '#f2f2f2';
        $event.srcElement.lastChild.data--;
        
      }else{
       this.addLike(reference_id, like_type);
       this.presentToast('You liked it');
        $event.srcElement.style.backgroundColor = '#296fb7';
        $event.srcElement.offsetParent.style.backgroundColor = '#296fb7';
        $event.srcElement.lastChild.data++;
      }
    },
    err =>{
      console.error("Error : "+err);         
    } ,
    () => {
      console.log('getData completed');
    }

    );
}

addLike(reference_id, like_type){
  this.rallyProvider.addLike(this.likeendpoint, reference_id, this.myApiRallyID, like_type).subscribe(
      response =>{
          console.log(response);
          this.disable = false;
      });

}

shareController(title, imgURI, reference_id, like_type, $event) {
  this.disable = true;

const actionSheet = this.actionSheetCtrl.create({
 title: 'Share to where?',
 buttons: [
   {
     text: 'Facebook',
     handler: () => {
       this.shareProvider.facebookShare(title, imgURI);
       this.addShareAction(reference_id, like_type);
       $event.srcElement.lastChild.data++;
       this.presentToast('Objective shared!');
       this.disable = false;

     }
   }, 
   {
     text: 'Twitter',
     handler: () => {
       this.shareProvider.twitterShare(title, imgURI);
       this.addShareAction(reference_id, like_type);
       $event.srcElement.lastChild.data++;
       this.presentToast('Objective shared!');
       this.disable = false;

     }
   },
  //  {
  //   text: 'Copy Link',
  //   handler: () => {
  //     this.disable = false;

  //   }
  // },
  // {
  //   text: 'SMS Message',
  //   handler: () => {
  //     this.presentToast('Objective shared!');
  //     this.disable = false;

  //   }
  // },
  // {
  //   text: 'Email',
  //   handler: () => {
      
  //     this.presentToast('Objective shared!');
  //     this.disable = false;

  //   }
  // },
   {
     text: 'Cancel',
     role: 'cancel',
     handler: () => {
       console.log('Cancel clicked');
       this.disable = false;

     }
   }
 ]
});

actionSheet.present();
}

addShareAction(goal_id, action_type_id){
  this.rallyProvider.addShareAction(this.favEndpoint, goal_id, action_type_id, this.myApiRallyID);
}

ellipsisController(name, id, index, orgID, followers){
  const actionSheet = this.actionSheetCtrl.create({
    buttons: [
    {
      text: 'Share this post via...',
      handler: () => {
        console.log("test");

      }
    }, 
    {
      text: 'Hide post',
      handler: () => {
       this.hideItem(id, index);
      }
    },
    {
      text: 'Turn on/off notifications for ' + name,
      handler: () => {
        console.log("test");

      }
    },
    {
      text: this.getOrganizationFollowStatus(followers) + ' ' + name,
      handler: () => {
        this.orgStatus(orgID);
        console.log("test");

      }
    },
    {
      text: 'Report',
      role: 'destructive',
      handler: () => {
        console.log("test");

      }
    },
    {
      text: 'Cancel',
      role: 'cancel',
      handler: () => {
        console.log('Cancel clicked');
      }
    }
  ]
});

actionSheet.present();
}


orgStatus(orgID){
  this.rallyProvider.getJsonData(this.organizationEndpoint+'?follower_id='+this.myApiRallyID+'&organization_id='+orgID).subscribe(
        result => {
          if(result != ""){
             this.unfollowOrg(result[0].id, orgID);
             console.log("Unfollow");
          }else{
            console.log("Follow");
            this.followOrg(orgID);
          }
        },
        err =>{
        console.error("Error : "+err);
        } ,
        () => {
        console.log('getData completed');
        });
        }


        unfollowOrg(recordID, orgID){

          this.rallyProvider.unfollowOrganization(this.organizationEndpoint, recordID);
          this.rallyProvider.removeFollowRecordID(orgID, 'organizations');
          this.presentToast("You're not following this organization anymore");
        }

        followOrg(organizationID){
          this.rallyProvider.followOrganization(this.organizationEndpoint, this.myApiRallyID, organizationID );
          this.presentToast("You're now following this organization");

        }


        eventEllipsisController(name, orgID, desc, followers){
          const actionSheet = this.actionSheetCtrl.create({
            buttons: [
            {
              text: 'Share this event via...',
              handler: () => {
                console.log("test");
                this.shareProvider.otherShare(name, desc);
        
              }
            }, 
            {
              text: 'Turn on/off notifications for ' + name,
              handler: () => {
                console.log("test");
        
              }
            },
            {
              text: this.getOrganizationFollowStatus(followers) + ' ' + name,
              handler: () => {
                this.orgStatus(orgID);
                console.log("test");
        
              }
            },
            {
              text: 'Report',
              role: 'destructive',
              handler: () => {
                console.log("test");
                this.shareProvider.shareViaEmail();
        
              }
            },
            {
              text: 'Cancel',
              role: 'cancel',
              handler: () => {
                console.log('Cancel clicked');
              }
            }
          ]
        });
        
        actionSheet.present();
        }

        goToEventDetail(eventID){
          console.log(eventID);
          this.navCtrl.push(EventDetailPage, {
                  eventID: eventID,
                  eventPageName: "Home"
            }, {animate:true,animation:'transition',duration:500,direction:'forward'});
        }

        getDay(day){
          var d = new Date(day);
          var weekday = new Array(7);
          weekday[0] = "SUNDAY";
          weekday[1] = "MONDAY";
          weekday[2] = "TUESDAY";
          weekday[3] = "WEDNESDAY";
          weekday[4] = "THURSDAY";
          weekday[5] = "FRIDAY";
          weekday[6] = "SATURDAY";
          var n = weekday[d.getDay()];
          return n;
        }
        getShortDate(day){
          var d = new Date(day);
          var monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN",
            "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
          // console.log(monthNames[d.getMonth()]);
          var date = monthNames[d.getMonth()] + ' ' + d.getDay();
          return date;
        }

        goToEventFilter(){
          // this.navCtrl.push(FilterEventsPage,  {}, {animate:true,animation:'ios-transition',duration:500,direction:'forward'});
          let modal = this.modalCtrl.create(FilterEventsPage, {location: 'orgs'});
          modal.onDidDismiss(() => {
            console.log('Test');
            this.getStartDate();
            
          });
          modal.present();
          
        }

        getStartDate(){
          this.storage.get('startDate').then((val) => {
            this.eventStart = val;
            this.getEndDate();

          });
        }

        getEndDate(){
          this.storage.get('endDate').then((val) => {
            this.eventEnd = val;
            this.getdata(this.eventStart, this.eventEnd);
          });
        }

        getOrganizationFollowStatus(actions){
          if (actions != null){
            var found = actions.some(el => { 
                return el.id == this.myApiRallyID;
              
            });
            
            if (!found){
              return 'Follow';
              
            }else{
              return 'Unfollow';
              
            }
          }
        }
}
