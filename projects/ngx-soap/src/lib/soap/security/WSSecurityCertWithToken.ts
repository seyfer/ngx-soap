"use strict";

import { WSSecurity } from './WSSecurity';
import { WSSecurityCert } from './WSSecurityCert';

/**
 * WS-Security with both certificate and username token
 * Combines WSSecurityCert with UsernameToken for dual authentication
 * 
 * @param privatePEM - Private key in PEM format
 * @param publicP12PEM - Public certificate in P12/PEM format
 * @param password - Certificate password
 * @param options - Additional options
 * @param options.username - Username for token authentication
 * @param options.password - Password for token authentication
 * @param options.passwordType - Type of password encoding ('PasswordText' or 'PasswordDigest')
 * @param options.hasTimeStamp - Include timestamp in security header (default: true)
 * @param options.hasNonce - Include nonce in security header
 * @param options.hasTokenCreated - Include created timestamp in token (default: true)
 */
export function WSSecurityCertWithToken(
  privatePEM: string | Buffer,
  publicP12PEM: string | Buffer,
  password: string,
  options: any
) {
  options = options || {};
  
  // Initialize certificate security with algorithm and exclusion options
  this.cert = new (WSSecurityCert as any)(privatePEM, publicP12PEM, password, {
    digestAlgorithm: options.digestAlgorithm,
    signatureAlgorithm: options.signatureAlgorithm,
    excludeReferencesFromSigning: options.excludeReferencesFromSigning
  });
  
  // Initialize username token security if credentials provided
  if (options.username && options.password) {
    this.token = new (WSSecurity as any)(options.username, options.password, {
      passwordType: options.passwordType,
      hasTimeStamp: options.hasTimeStamp,
      hasNonce: options.hasNonce,
      hasTokenCreated: options.hasTokenCreated,
      actor: options.actor,
      mustUnderstand: options.mustUnderstand
    });
  }
}

/**
 * Generate the WS-Security XML header
 * Returns username token XML (certificate is added via postProcess)
 */
WSSecurityCertWithToken.prototype.toXML = function(): string {
  // Only return username token if provided
  // Certificate security is handled via postProcess
  if (this.token) {
    return this.token.toXML();
  }
  return '';
};

/**
 * Post-process the SOAP envelope to add signature
 */
WSSecurityCertWithToken.prototype.postProcess = function(xml: string, envelopeKey: string): string {
  if (this.cert && this.cert.postProcess) {
    return this.cert.postProcess(xml, envelopeKey);
  }
  return xml;
};

/**
 * Add additional options to the security configuration
 */
WSSecurityCertWithToken.prototype.addOptions = function(options: any): void {
  if (this.token && options.username) {
    this.token._username = options.username;
  }
  if (this.token && options.password) {
    this.token._password = options.password;
  }
};

