import { Component, AfterViewInit, Input, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import 'jquery.fancytree';
import { IFancytreeOptions } from '../../interfaces';

@Component({
  selector: 'app-fancy-tree',
  templateUrl: './fancy-tree.component.html',
  styleUrls: ['./fancy-tree.component.scss']
})
export class FancyTreeComponent implements AfterViewInit {
  @ViewChild('fancyTree') public tree: ElementRef;
  @Input() public nodes: any;
  @Input() public options: IFancytreeOptions;
  @Output() public itemSelect: EventEmitter<Fancytree.FancytreeNode> = new EventEmitter();

  ngAfterViewInit() {
    let options: IFancytreeOptions = {
      extensions: ['glyph'],
      clickFolderMode: 3,
      source: this.nodes,
      glyph: {
        preset: 'awesome4',
        map: {
          folder: 'fa fa-folder-o fa-lg',
          folderOpen: 'fa fa-folder-open-o fa-lg'
        }
      },
      click: (event, data): boolean => {
        const node = data.node;
        this.itemSelect.emit(node);
        return true;
      },
    };
    options = { ...options, ...this.options };
    $(this.tree.nativeElement).fancytree(options);
    if (this.options.showConnectors) {
      $('.fancytree-container').addClass('fancytree-connectors');
    }
  }
}
