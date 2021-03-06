import { Component, Input } from '@angular/core';
import { ResourceService } from '@sunbird/shared';
@Component({
  selector: 'app-curriculum-card',
  templateUrl: './curriculum-card.component.html',
  styleUrls: ['./curriculum-card.component.css']
})
export class CurriculumCardComponent {
  @Input() curriculum: any;

  public resourceService: ResourceService;
  constructor(resourceService: ResourceService) {
    this.resourceService = resourceService;
  }

}
