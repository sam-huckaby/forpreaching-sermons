import { Component, OnInit, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject } from 'rxjs';

import { environment } from '../../../../environments/environment';

import { Sermon } from '../../../core/interfaces/sermon.interface';

@Component({
  selector: 'sermon-collection',
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.scss']
})
export class CollectionComponent implements OnInit {

  @Input() caption: string;
  @Input() entries: Sermon[];

  constructor() { }

  ngOnInit(): void {
    this.entries = [];
  }
}
