import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { share } from 'rxjs/operators';

import { faSearch } from '@fortawesome/free-solid-svg-icons';

import { Sermon } from '../../core/interfaces/sermon.interface';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  // The form itself
  @ViewChild('dashboardForm') dashboardForm;

  // Icons
  faSearch = faSearch;

  // FormGroup
  dashboardFormGroup: FormGroup;
  search$: Observable<Sermon[] | ArrayBuffer>;

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient
  ) { }

  search(): void {
    // Look for sermons using provided criteria
    this.search$ = this.http.get<Sermon[]>('/api/sermons', {responseType: 'json', params: this.dashboardForm.value}).pipe(share());
  }

  calculateReadTime(sermonText): number {
    return Math.ceil(((sermonText.split(' ')).length/125)*60) * 1000
  }

  ngOnInit(): void {
    this.dashboardFormGroup = this.formBuilder.group({
      title: [''],
      scripture: ['']
    });
  }
}
