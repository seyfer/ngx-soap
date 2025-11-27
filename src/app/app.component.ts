import { Component, signal, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NgxSoapService, Client, ISoapMethodResponse } from '../../projects/ngx-soap/src/public_api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    MatToolbarModule
  ]
})
export class AppComponent {
  // Modern Angular signals for reactive state
  title = 'SOAP Calculator app';
  intA = signal<number | undefined>(undefined);
  intB = signal<number | undefined>(undefined);
  loading = signal(false);
  showDiagnostic = signal(false);
  message = signal('');
  xmlResponse = signal('');
  jsonResponse = signal('');
  resultLabel = 'Result';
  client: Client | null = null;

  // Modern dependency injection
  private soap = inject(NgxSoapService);
  private destroyRef = inject(DestroyRef);

  constructor() {
    // Initialize SOAP client
    this.soap.createClient('assets/calculator.wsdl')
      .then(client => {
        this.client = client;
      })
      .catch(err => console.error('Error creating SOAP client:', err));
  }

  sum() {
    if (!this.client) return;

    this.loading.set(true);
    const body = {
      intA: this.intA(),
      intB: this.intB()
    };

    (<any>this.client).Add(body)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: ISoapMethodResponse) => {
          this.xmlResponse.set(res.xml);
          this.jsonResponse.set(JSON.stringify(res.result, null, 2));
          this.message.set(res.result.AddResult);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error calling Add method:', err);
          this.loading.set(false);
        }
      });
  }

  subtract() {
    if (!this.client) return;

    this.loading.set(true);
    const body = {
      intA: this.intA(),
      intB: this.intB()
    };

    (<any>this.client).Subtract(body)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: ISoapMethodResponse) => {
          this.xmlResponse.set(res.xml);
          this.jsonResponse.set(JSON.stringify(res.result, null, 2));
          this.message.set(res.result.SubtractResult);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error calling Subtract method:', err);
          this.loading.set(false);
        }
      });
  }

  toggleDiagnostic() {
    this.showDiagnostic.set(!this.showDiagnostic());
  }
}
