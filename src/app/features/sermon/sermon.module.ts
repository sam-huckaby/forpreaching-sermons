import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';

// 3rd Party libraries
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

// TinyMCE
import { EditorModule } from '@tinymce/tinymce-angular';

import { SermonRoutingModule } from './sermon-routing.module';
import { SermonComponent, ConfirmDeleteDialog } from './sermon.component';

@NgModule({
  declarations: [
    SermonComponent,
    ConfirmDeleteDialog
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SermonRoutingModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTabsModule,
    FontAwesomeModule,
    EditorModule,
  ],
  entryComponents: [
    ConfirmDeleteDialog
  ],
})
export class SermonModule { }