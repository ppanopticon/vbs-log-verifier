import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import {MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule, MatListModule} from '@angular/material';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ServiceModule} from './services/service.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
      BrowserModule,
      BrowserAnimationsModule,
      MatCardModule,
      MatFormFieldModule,
      MatInputModule,
      MatListModule,
      MatButtonModule,
      ServiceModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
