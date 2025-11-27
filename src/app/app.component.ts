import { Component } from '@angular/core';
import { NgxSoapService, Client, ISoapMethodResponse } from '../../projects/ngx-soap/src/public_api';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    standalone: false
})
export class AppComponent {
  title = 'SOAP Calculator app';
  intA: number;
  intB: number;
  loading: boolean;
  showDiagnostic: boolean;
  message: string;
  xmlResponse: string;
  jsonResponse: string;
  resultLabel: string;
  client: Client;

  constructor(private soap: NgxSoapService) {
    this.soap.createClient('assets/calculator.wsdl')
      .then(client => {
        this.client = client;
      })
      .catch(err => console.error('Error creating SOAP client:', err));
  }

  sum() {
    this.loading = true;
    const body = {
      intA: this.intA,
      intB: this.intB
    };
    (<any>this.client).Add(body).subscribe(
      (res: ISoapMethodResponse) => {
        this.xmlResponse = res.xml;
        this.message = res.result.AddResult;
        this.loading = false;
      },
      err => console.error('Error calling Add method:', err)
    );
  }

  subtract() {
    this.loading = true;
    const body = {
      intA: this.intA,
      intB: this.intB
    };
    (<any>this.client).Subtract(body).subscribe(
      (res: ISoapMethodResponse) => {
        this.xmlResponse = res.xml;
        this.message = res.result.SubtractResult;
        this.loading = false;
      },
      err => console.error('Error calling Subtract method:', err)
    );
  }
}
