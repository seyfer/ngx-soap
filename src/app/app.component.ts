import { Component, signal, computed, model, inject, effect, resource } from '@angular/core';
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
  title = 'SOAP Calculator app';
  
  // 🆕 Angular 20: model() for cleaner two-way binding
  intA = model<number | undefined>(undefined);
  intB = model<number | undefined>(undefined);
  
  // Regular signals
  loading = signal(false);
  showDiagnostic = signal(false);
  message = signal('');
  xmlResponse = signal('');
  jsonResponse = signal('');
  resultLabel = 'Result';
  
  // 🆕 Angular 20: computed() for derived state
  hasValidInputs = computed(() => {
    const a = this.intA();
    const b = this.intB();
    return a !== undefined && b !== undefined && !isNaN(a) && !isNaN(b);
  });
  
  // 🆕 Angular 20: computed() for button disabled state
  isReadyToCalculate = computed(() => 
    this.hasValidInputs() && 
    this.soapClient.value() !== undefined &&
    !this.loading()
  );

  private soap = inject(NgxSoapService);
  
  // 🆕 Angular 20: resource() API for async client initialization
  soapClient = resource({
    loader: async () => {
      return await this.soap.createClient('assets/calculator.wsdl');
    }
  });

  constructor() {
    // 🆕 Angular 20: effect() for side effects (logging)
    effect(() => {
      if (this.loading()) {
        console.log('🔄 Starting calculation...');
      }
    });
    
    effect(() => {
      const msg = this.message();
      if (msg) {
        console.log('✅ Result:', msg);
      }
    });
    
    // 🆕 Angular 20: effect() for SOAP client status logging
    effect(() => {
      if (this.soapClient.isLoading()) {
        console.log('📡 Loading SOAP client...');
      } else if (this.soapClient.value()) {
        console.log('✅ SOAP client ready');
      } else if (this.soapClient.error()) {
        console.error('❌ SOAP client error:', this.soapClient.error());
      }
    });
  }

  sum() {
    const client = this.soapClient.value();
    if (!client || !this.hasValidInputs()) return;

    this.loading.set(true);
    const body = {
      intA: this.intA(),
      intB: this.intB()
    };

    (client as any).Add(body).subscribe({
      next: (res: ISoapMethodResponse) => {
        this.xmlResponse.set(res.xml);
        this.jsonResponse.set(JSON.stringify(res.result, null, 2));
        this.message.set(res.result.AddResult);
        this.loading.set(false);
      },
      error: (err: Error) => {
        console.error('Error calling Add method:', err);
        this.message.set('Error: ' + err.message);
        this.loading.set(false);
      }
    });
  }

  subtract() {
    const client = this.soapClient.value();
    if (!client || !this.hasValidInputs()) return;

    this.loading.set(true);
    const body = {
      intA: this.intA(),
      intB: this.intB()
    };

    (client as any).Subtract(body).subscribe({
      next: (res: ISoapMethodResponse) => {
        this.xmlResponse.set(res.xml);
        this.jsonResponse.set(JSON.stringify(res.result, null, 2));
        this.message.set(res.result.SubtractResult);
        this.loading.set(false);
      },
      error: (err: Error) => {
        console.error('Error calling Subtract method:', err);
        this.message.set('Error: ' + err.message);
        this.loading.set(false);
      }
    });
  }

  toggleDiagnostic() {
    // 🆕 Angular 20: use update() for signal transformations
    this.showDiagnostic.update(value => !value);
  }
}
