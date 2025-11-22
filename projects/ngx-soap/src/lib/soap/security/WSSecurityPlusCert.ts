"use strict";

import { WSSecurity } from './WSSecurity';
import { WSSecurityCert } from './WSSecurityCert';

/**
 * Combined WSSecurity and WSSecurityCert
 * Allows using both username token and certificate security together
 * 
 * @param wsSecurity - WSSecurity instance for username token
 * @param wsSecurityCert - WSSecurityCert instance for certificate
 */
export function WSSecurityPlusCert(
  wsSecurity: any,
  wsSecurityCert: any
) {
  if (!wsSecurity) {
    throw new Error('WSSecurity instance is required');
  }
  if (!wsSecurityCert) {
    throw new Error('WSSecurityCert instance is required');
  }
  
  this.wsSecurity = wsSecurity;
  this.wsSecurityCert = wsSecurityCert;
}

/**
 * Generate the WS-Security XML header
 * Returns username token XML (certificate is added via postProcess)
 */
WSSecurityPlusCert.prototype.toXML = function(): string {
  // Only return WSSecurity (username token)
  // Certificate security is handled via postProcess
  if (this.wsSecurity && this.wsSecurity.toXML) {
    return this.wsSecurity.toXML();
  }
  return '';
};

/**
 * Post-process the SOAP envelope to add signature
 */
WSSecurityPlusCert.prototype.postProcess = function(xml: string, envelopeKey: string): string {
  // Apply certificate post-processing if available
  if (this.wsSecurityCert && this.wsSecurityCert.postProcess) {
    return this.wsSecurityCert.postProcess(xml, envelopeKey);
  }
  return xml;
};

/**
 * Add additional options to both security configurations
 */
WSSecurityPlusCert.prototype.addOptions = function(options: any): void {
  if (this.wsSecurity && options.username) {
    this.wsSecurity._username = options.username;
  }
  if (this.wsSecurity && options.password) {
    this.wsSecurity._password = options.password;
  }
};

