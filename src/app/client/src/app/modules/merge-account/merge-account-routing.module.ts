import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {MergeAccountStatusComponent} from './components/merge-account-status/merge-account-status.component';
import {UserDetailsComponent} from './components/user-details/user-details.component';

const routes: Routes = [
  {path: '', component: MergeAccountStatusComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MergeAccountRoutingModule {
}
