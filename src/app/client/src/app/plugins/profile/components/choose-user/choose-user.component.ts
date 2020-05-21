import {Component, OnInit} from '@angular/core';
import {ProfileService} from './../../services';
import {UserService} from "@sunbird/core";
import {ConfigService, ServerResponse, ToasterService} from "@sunbird/shared";
import {Router} from '@angular/router';
import {TelemetryService} from "@sunbird/telemetry";
import {environment} from "@sunbird/environment";
import * as _ from 'lodash-es';

@Component({
  selector: 'app-choose-user',
  templateUrl: './choose-user.component.html',
  styleUrls: ['./choose-user.component.scss']
})
export class ChooseUserComponent implements OnInit {

  constructor(public profileService: ProfileService, public userService: UserService,
              public toasterService: ToasterService, public router: Router,
              private telemetryService: TelemetryService, private configService: ConfigService) {
  }

  userList: [];
  selectedUser: {};

  ngOnInit() {
    this.getManagedUserList();
  }

  updateSelectedUser(event) {
    this.selectedUser = event;
  }

  getManagedUserList() {
    const fetchManagedUserRequest = {
      request: {
        filters: {
          managedBy: this.userService.userid
        },
        offset: 0,
        limit: 20
      }
    };
    this.profileService.fetchManagedUserList(fetchManagedUserRequest).subscribe((data: ServerResponse) => {
        this.userList = data.result.response.content;
        console.log(this.userList);
      }, (err) => {
        // this.toasterService.error(_.get(this.resourceService, 'messages.fmsg.m0004'));
      }
    );
  }

  switchUser(userId) {
    this.profileService.initiateSwitchUser(userId).subscribe((data) => {
        // @ts-ignore
        document.getElementById('userId').value = 'de35f92e-08a9-462d-b9e0-4d909c37227c';
        this.userService.setUserId('de35f92e-08a9-462d-b9e0-4d909c37227c');
        this.userService.initialize(true);
        this.telemetryService.initialize(this.getTelemetryContext());
      }, (err) => {
      // this.toasterService.error(_.get(this.resourceService, 'messages.fmsg.m0004'));
      }
    );
  }

  navigateToCreateUser() {
    this.router.navigate(['/profile/create-user']);
  }

  getTelemetryContext() {
    const userProfile = this.userService.userProfile;
    const buildNumber = (<HTMLInputElement>document.getElementById('buildNumber'));
    const version = buildNumber && buildNumber.value ? buildNumber.value.slice(0, buildNumber.value.lastIndexOf('.')) : '1.0';
    return {
      userOrgDetails: {
        userId: userProfile.userId,
        rootOrgId: userProfile.rootOrgId,
        rootOrg: userProfile.rootOrg,
        organisationIds: userProfile.hashTagIds
      },
      config: {
        pdata: {
          id: this.userService.appId,
          ver: version,
          pid: this.configService.appConfig.TELEMETRY.PID
        },
        endpoint: this.configService.urlConFig.URLS.TELEMETRY.SYNC,
        apislug: this.configService.urlConFig.URLS.CONTENT_PREFIX,
        host: '',
        uid: userProfile.userId,
        sid: this.userService.sessionId,
        channel: _.get(userProfile, 'rootOrg.hashTagId'),
        env: 'home',
        enableValidation: environment.enableTelemetryValidation,
        timeDiff: this.userService.getServerTimeDiff
      }
    }
  }
}
