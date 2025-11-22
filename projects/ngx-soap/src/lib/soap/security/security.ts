"use strict";

import { BasicAuthSecurity } from './BasicAuthSecurity';
import { WSSecurity } from './WSSecurity';
import { WSSecurityCert } from './WSSecurityCert';
import { WSSecurityCertWithToken } from './WSSecurityCertWithToken';
import { WSSecurityPlusCert } from './WSSecurityPlusCert';
import { BearerSecurity } from './BearerSecurity';
import { NTLMSecurity } from './NTLMSecurity';

export const security = { 
  BasicAuthSecurity,
  BearerSecurity,
  WSSecurity,
  WSSecurityCert,
  WSSecurityCertWithToken,
  WSSecurityPlusCert,
  NTLMSecurity,
  // ClientSSLSecurity,
  // ClientSSLSecurityPFX
};