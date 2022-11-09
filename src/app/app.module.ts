import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { TopbarComponent } from './components/topbar/topbar.component';
import { EditorComponent } from './components/editor/editor.component';
import { HttpClientModule } from '@angular/common/http';

import { AceModule } from 'ngx-ace-wrapper';

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    TopbarComponent,
    EditorComponent,
  ],
  imports: [
    AceModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
  ],
  providers: [HttpClientModule],
  bootstrap: [AppComponent]
})
export class AppModule { }
