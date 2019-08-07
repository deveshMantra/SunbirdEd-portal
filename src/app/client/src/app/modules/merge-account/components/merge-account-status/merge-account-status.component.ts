import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {NavigationHelperService} from '@sunbird/shared';

@Component({
  selector: 'app-merge-account-status',
  templateUrl: './merge-account-status.component.html',
  styleUrls: ['./merge-account-status.component.scss']
})
export class MergeAccountStatusComponent implements OnInit {
  @ViewChild('modal') modal;
  isMergeSuccess: any = {};

  constructor(public activatedRoute: ActivatedRoute,
              public navigationHelperService: NavigationHelperService, private router: Router) {
  }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe((queryParams) => {
      const queryParam = {...queryParams};
      this.isMergeSuccess = queryParam.status === 'success';
    });
  }

  closeModal() {
    this.router.navigate(['/learn']);
    this.modal.deny();
  }
}
