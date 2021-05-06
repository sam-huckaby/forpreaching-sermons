// Angular libraries
import { Component, OnInit, AfterViewInit, ViewChild, Inject } from '@angular/core';
import { Location } from '@angular/common'
import { HttpClient } from '@angular/common/http';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

// Angular Material libraries
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AuthService } from '@auth0/auth0-angular';

import { Subject, BehaviorSubject, Observable, empty } from 'rxjs';
import { tap, debounceTime, switchMap, takeUntil, catchError, map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';

import { Sermon } from '../../core/interfaces/sermon.interface';

import { faTrash, faSync, faCheck, faExclamationTriangle, faPaperPlane } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'forpreaching-sermon',
  templateUrl: './sermon.component.html',
  styleUrls: ['./sermon.component.scss']
})
export class SermonComponent implements OnInit,AfterViewInit {
  // The form itself
  @ViewChild('editSermonForm') editForm;
  @ViewChild('commentSermonForm') commentSermonForm;
  @ViewChild('sermonTabGroup', { static: false }) public tabGroup: any;

  public activeTabIndex: number | undefined = undefined;

  public commentSubmitted: Boolean = false

  faTrash = faTrash;
  faSync = faSync;
  faCheck = faCheck;
  faExclamationTriangle = faExclamationTriangle;
  faPaperPlane = faPaperPlane;

  sermonForm: FormGroup;
  commentForm: FormGroup;
  sermonId: String;
  userId: String;
  createLink: String = environment.studiesUrl + '/create/';

  private unsubscribe = new Subject<void>();
  private saveStatus: boolean = true;
  private failStatus: boolean = false;

  // Streams
  delete$: Observable<boolean>
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  sermon$: BehaviorSubject<Sermon> = new BehaviorSubject({} as Sermon);

  readTime: Number;

  constructor(
    private http: HttpClient,
    private location: Location,
    private route: ActivatedRoute,
    public auth: AuthService,
    private formBuilder: FormBuilder,
    private _snackBar: MatSnackBar,
    private _sanitizer: DomSanitizer,
    public dialog: MatDialog) { }

  public ngOnInit() {
    // Display loading veil
    this.isLoading$.next(true);

    this.sermonForm = this.formBuilder.group({
      title: ['', Validators.required],
      scripture: ['', Validators.required],
      summary: [''],
      video: [''],
      allowComments: [false],
      public: [false],
      body: ['', Validators.required]
    });

    this.commentForm = this.formBuilder.group({
      body: ['', Validators.required]
    });

    // Auto-save functionality, so that I stop losing sermon content because I forgot to click "save"
    this.sermonForm.valueChanges.pipe(
      tap(() => {
        this.failStatus = false;
        this.saveStatus = false;
      }),
      debounceTime(1500),
      switchMap(formValue => this.doSave(this.sermonId, formValue)),
      takeUntil(this.unsubscribe)
    ).subscribe(() => {
      this.saveStatus = true;
    }, (e) => {
      // TODO: Create an error message to alert the user to fix their data
    });

    // Anytime the current sermon changes, patch the form to match
    this.sermon$.subscribe((newValue) => {
      this.sermonForm.patchValue(newValue);
      // A quick calculation using an average reading time of 125 WPM
      this.readTime = Math.ceil(((this.sermonForm.value.body.split(' ')).length/125)*60);
    });

    // Retrieve the route params so we can get the user and then the sermon
    this.route.params.subscribe(params => {
      // Retrieve the user information from Auth0
      this.auth.user$.subscribe((user) => {
        // Once we have the user, we can grab the sermon from the DB
        this.userId = user.sub;
        this.http.get<Sermon>('/api/sermons/'+params['id'], {responseType: 'json', observe: 'response'})
        .pipe(
          map((data: any) => {
            let sermon = {
              ...data.body,
              canManage: data.headers.get('Administer-Sermons') === 'true'
            };
            return sermon;
          })
        )
        .subscribe((sermon) => {
          // Once we have the sermon, populate the data management BehaviorSubject
          this.sermon$.next(sermon);
          // Keep track of this sermon's ID
          this.sermonId = sermon._id;
        }, (caught) => {
          this._snackBar.open(caught.error.info, "Got it", {
            duration: 5000,
          });
        }, () => {
          // Stop displaying the loading veil no matter what
          this.isLoading$.next(false);
        });
      });
    });
  }

  public ngAfterViewInit(): void {
    if (this.tabGroup) {
      this.activeTabIndex = this.tabGroup.selectedIndex;
    }
  }

  public ngOnDestroy(): void {
      this.unsubscribe.next()
  }

  public handleTabChange(e: MatTabChangeEvent) {
    this.activeTabIndex = e.index;
  }

  deleteSermon(): void {
    // Display loading veil
    this.isLoading$.next(true);

    // Open a simple dialog to confirm that the user wants to delete the sermon
    let confirmDeleteDialogRef = this.dialog.open(ConfirmDeleteDialog, {});

    // Wait to hear back from the user before deleting
    confirmDeleteDialogRef.afterClosed().subscribe(result => {
      if(result) {
        // Make the request to Node to actually delete the sermon
        this.http.delete<boolean>('/api/sermons/'+this.sermonId, {responseType: 'json'})
        .subscribe((success) => {
          // If the sermon was deleted, navigate back to the last page the user was on
          this.location.back();
        }, (caught) => {
          // Open a Material Snackbar
          this._snackBar.open(caught.error.info, "Got it", {
            duration: 5000,
          });
        }, () => {
          // Stop displaying the loading veil no matter what
          this.isLoading$.next(false);
        });
      } else {
        // Stop displaying the loading veil no matter what
        this.isLoading$.next(false);
      }
    });
  }

  resetChanges(): void {
    // Reset the form to the last sermon value
    this.sermonForm.reset(this.sermon$.getValue());
  }

  // saveChanges(silent: boolean = false): void {
  //   if(!silent) {
  //     // Display loading veil
  //     this.isLoading$.next(true);
  //   }
    
  //   // Send the request to save the form's data
  //   // this.http.put<Sermon>('/api/sermons/'+this.sermonId, this.sermonForm.value, {responseType: 'json'})
  //   this.doSave(this.sermonId, this.sermonForm.value)
  //   .subscribe((sermon) => {
  //     // Once we have the sermon, populate the data management BehaviorSubject
  //     this.sermon$.next(sermon);
  //     // Mark the form as pristine again
  //     this.sermonForm.markAsPristine();
  //     // Stop displaying the loading veil
  //     this.isLoading$.next(false);
  //   }, (caught) => {
  //     // Stop displaying the loading veil
  //     this.isLoading$.next(false);
  //     this._snackBar.open(caught.error.info, "Got it", {
  //       duration: 5000,
  //     });
  //   })
  // }

  commentOnSermon(): void {
    
    this.commentSubmitted = true;

    // build request populated with commentForm's values and send it to the API
    this.http.post('/api/sermons/'+this.sermonId+'/comments', this.commentForm.value, {responseType: 'json'}).subscribe((success) => {
      setTimeout(() => {
        this.commentForm.reset();
        // I hesitate to use the next line, because it breaks all errors going forward and prevents validation
        // this.commentForm.controls['body'].setErrors(null);
        this.commentSubmitted = false;
      }, 3000)
    });
  }

  doSave(sermonId, values) {
    return this.http.put<Sermon>('/api/sermons/'+sermonId, values, {responseType: 'json', observe: 'response'})
    .pipe(
      map((data: any) => {
        let sermon = {
          ...data.body,
          canManage: data.headers.get('Administer-Sermons') === 'true'
        };
        return sermon;
      })
    )
    .pipe(
      map((res: Sermon) => {
        if (res) {
          return res;
        } else {
          return {} as Sermon;
        }
      }),
      catchError(err => {
        console.log(err);
        // report error to user
        this.failStatus = true;
        // Important: stop observable from emitting anything
        return empty();
    })
    );
  }

  updateReadingTime() {
    // Is this the right place to do this? Will it be too time intensive with a large sermon?
    this.readTime = Math.ceil(((this.sermonForm.value.body.split(' ')).length/125)*60);
  }

  sanitizeUrl(url): SafeResourceUrl {
    // Fact check
    if (!url) {
      // No URL provided, why have we come here?
      return '';
    }

    let youtube = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(\?\S*)?$/;
    let match = url.match(youtube);

    if (match && match[1].length === 11) {
      return this._sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/'+match[1]);
    }
  }

  featureThis() {
    // Display loading veil
    this.isLoading$.next(true);

    // Send the request to feature this sermon
    this.http.post<Sermon>('/api/sermons/'+this.sermonId+'/feature', {}, {responseType: 'json', observe: 'response'})
    .pipe(
      map((data: any) => {
        let sermon = {
          ...data.body,
          canManage: data.headers.get('Administer-Sermons') === 'true'
        };
        return sermon;
      })
    )
    .subscribe((sermon) => {
      // Once we have the sermon, populate the data management BehaviorSubject
      this.sermon$.next(sermon);
      // Mark the form as pristine again
      this.sermonForm.markAsPristine();
    }, (caught) => {
      this._snackBar.open(caught.error.info, "Got it", {
        duration: 5000,
      });
    }, () => {
      // Stop displaying the loading veil
      this.isLoading$.next(false);
    });
  }
}

// Pretty simple dialog, so I'm just embedding it here
@Component({
  selector: 'dialog-overview-example-dialog',
  template: ` <h2 mat-dialog-title>Delete this sermon?</h2>
              <mat-dialog-content>This will delete the current sermon and cannot be undone.</mat-dialog-content>
              <mat-dialog-actions>
                <button mat-button [mat-dialog-close]="false">Cancel</button>
                <!-- The mat-dialog-close directive optionally accepts a value as a result for the dialog. -->
                <button mat-button [mat-dialog-close]="true" color="warn">Delete</button>
              </mat-dialog-actions>`,
})
export class ConfirmDeleteDialog {

  constructor(
    public dialogRef: MatDialogRef<ConfirmDeleteDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

}