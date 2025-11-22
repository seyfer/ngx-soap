"use strict";

// var fs = require('fs');
// var path = require('path');
// var ejs = require('ejs');
// var SignedXml = require('xml-crypto').SignedXml;

import { SignedXml } from 'xml-crypto';

let wsseSecurityHeaderTemplate;
let wsseSecurityTokenTemplate;

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}

function dateStringForSOAP(date) {
  return date.getUTCFullYear() + '-' + ('0' + (date.getUTCMonth() + 1)).slice(-2) + '-' +
    ('0' + date.getUTCDate()).slice(-2) + 'T' + ('0' + date.getUTCHours()).slice(-2) + ":" +
    ('0' + date.getUTCMinutes()).slice(-2) + ":" + ('0' + date.getUTCSeconds()).slice(-2) + "Z";
}

function generateCreated() {
  return dateStringForSOAP(new Date());
}

function generateExpires() {
  return dateStringForSOAP(addMinutes(new Date(), 10));
}

function insertStr(src, dst, pos) {
  return [dst.slice(0, pos), src, dst.slice(pos)].join('');
}

/**
 * Generate a UUID using native crypto API with fallback for non-secure contexts
 */
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for non-secure contexts (HTTP)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function generateId() {
  return generateUUID().replace(/-/gm, '');
}

export function WSSecurityCert(privatePEM, publicP12PEM, password, options?) {
  options = options || {};
  
  this.publicP12PEM = publicP12PEM.toString().replace('-----BEGIN CERTIFICATE-----', '').replace('-----END CERTIFICATE-----', '').replace(/(\r\n|\n|\r)/gm, '');

  // Store algorithm options
  this.digestAlgorithm = options.digestAlgorithm || 'sha256';
  this.signatureAlgorithm = options.signatureAlgorithm || 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256';
  
  // Store reference exclusion options
  this.excludeReferencesFromSigning = options.excludeReferencesFromSigning || [];
  
  // Custom XML to append to security header (e.g., custom authentication elements)
  this.appendElement = options.appendElement || '';

  this.signer = new SignedXml();
  this.signer.signatureAlgorithm = this.signatureAlgorithm;
  this.signer.canonicalizationAlgorithm = 'http://www.w3.org/2001/10/xml-exc-c14n#';
  this.signer.signingKey = {
    key: privatePEM,
    passphrase: password
  };
  this.x509Id = "x509-" + generateId();

  var _this = this;
  this.signer.keyInfoProvider = {};
  this.signer.keyInfoProvider.getKeyInfo = function (key) {
    if (!wsseSecurityTokenTemplate) {
      // wsseSecurityTokenTemplate = ejs.compile(fs.readFileSync(path.join(__dirname, 'templates', 'wsse-security-token.ejs')).toString());
    }

    // return wsseSecurityTokenTemplate({ x509Id: _this.x509Id });
    return `
      <wsse:SecurityTokenReference>
        <wsse:Reference URI="#${this.x509Id}" ValueType="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-x509-token-profile-1.0#X509v3"/>
      </wsse:SecurityTokenReference>
    `;
  };
}

WSSecurityCert.prototype.postProcess = function (xml, envelopeKey) {
  this.created = generateCreated();
  this.expires = generateExpires();

  if (!wsseSecurityHeaderTemplate) {
    // wsseSecurityHeaderTemplate = ejs.compile(fs.readFileSync(path.join(__dirname, 'templates', 'wsse-security-header.ejs')).toString());
  }

  // var secHeader = wsseSecurityHeaderTemplate({
  //   binaryToken: this.publicP12PEM,
  //   created: this.created,
  //   expires: this.expires,
  //   id: this.x509Id
  // });

  // Build security header with optional custom XML element
  var secHeader = `
    <wsse:Security xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd"
                  xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd"
                  soap:mustUnderstand="1">
      <wsse:BinarySecurityToken   
          EncodingType="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-soap-message-security-1.0#Base64Binary" 
          ValueType="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-x509-token-profile-1.0#X509v3" 
          wsu:Id="${this.x509Id}">${this.publicP12PEM}</wsse:BinarySecurityToken>
      <Timestamp xmlns="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd" Id="_1"> 
        <Created>${this.created}</Created>
        <Expires>${this.expires}</Expires>
      </Timestamp>${this.appendElement}
    </wsse:Security>
  `;

  var xmlWithSec = insertStr(secHeader, xml, xml.indexOf('</soap:Header>'));

  var references = ["http://www.w3.org/2000/09/xmldsig#enveloped-signature",
    "http://www.w3.org/2001/10/xml-exc-c14n#"];

  // Add references conditionally based on excludeReferencesFromSigning option
  const shouldExclude = (refName) => {
    return this.excludeReferencesFromSigning && 
           this.excludeReferencesFromSigning.some(excluded => 
             refName.toLowerCase().includes(excluded.toLowerCase())
           );
  };

  // Use the configured digest algorithm for references
  if (!shouldExclude('Body')) {
    this.signer.addReference({
      xpath: "//*[name(.)='" + envelopeKey + ":Body']",
      transforms: references,
      digestAlgorithm: 'http://www.w3.org/2001/04/xmlenc#' + this.digestAlgorithm
    });
  }
  
  if (!shouldExclude('Timestamp')) {
    this.signer.addReference({
      xpath: "//*[name(.)='wsse:Security']/*[local-name(.)='Timestamp']",
      transforms: references,
      digestAlgorithm: 'http://www.w3.org/2001/04/xmlenc#' + this.digestAlgorithm
    });
  }

  this.signer.computeSignature(xmlWithSec);

  return insertStr(this.signer.getSignatureXml(), xmlWithSec, xmlWithSec.indexOf('</wsse:Security>'));
};

// module.exports = WSSecurityCert;
