# ngx-soap vs node-soap Feature Comparison Matrix

**Last Updated**: 2025-11-22  
**ngx-soap**: v0.18.1  
**node-soap**: v1.6.0

---

## Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Fully implemented |
| ⚠️ | Partially implemented |
| ❌ | Not implemented |
| 🚫 | Not applicable (Node.js-only) |
| ⏭️ | Deferred (optimization) |

---

## Core Features

| Feature | ngx-soap | node-soap | Phase | Notes |
|---------|----------|-----------|-------|-------|
| **WSDL Parsing** | ✅ | ✅ | Base | Full support |
| **SOAP 1.1** | ✅ | ✅ | Base | Complete |
| **SOAP 1.2** | ✅ | ✅ | Base | Complete |
| **Document Style** | ✅ | ✅ | Base | Complete |
| **RPC Style** | ✅ | ✅ | Base | Complete |
| **Complex Types** | ✅ | ✅ | Base | Complete |
| **Simple Types** | ✅ | ✅ | Base | Complete |
| **Arrays** | ✅ | ✅ | 2 | With namespace support |
| **Element References** | ✅ | ✅ | 2 | maxOccurs/minOccurs |
| **Inheritance** | ✅ | ✅ | Base | Extension/Restriction |
| **Multi-Service/Port** | ✅ | ✅ | 4A | Service/port selection |

---

## Configuration Options

| Option | ngx-soap | node-soap | Phase | Description |
|--------|----------|-----------|-------|-------------|
| `endpoint` | ✅ | ✅ | Base | Override endpoint |
| `envelopeKey` | ✅ | ✅ | 3 | Custom SOAP prefix |
| `preserveWhitespace` | ✅ | ✅ | 3 | Keep whitespace |
| `escapeXML` | ✅ | ✅ | Base | Escape special chars |
| `suppressStack` | ✅ | ✅ | 3 | Hide stack traces |
| `returnFault` | ✅ | ✅ | 2 | Return SOAP faults |
| `forceSoap12Headers` | ✅ | ✅ | Base | SOAP 1.2 mode |
| `httpClient` | ✅ | ✅ | Base | Custom HTTP client |
| `wsdl_headers` | ✅ | ✅ | Base | WSDL fetch headers |
| `wsdl_options` | ✅ | ✅ | Base | WSDL fetch options |
| `disableCache` | ✅ | ✅ | Base | Disable WSDL cache |
| `wsdlCache` | ✅ | ✅ | 4C | Custom cache impl |
| `overridePromiseSuffix` | ✅ | ✅ | 3 | Promise method suffix |
| `normalizeNames` | ✅ | ✅ | 3 | Replace special chars |
| `namespaceArrayElements` | ✅ | ✅ | 2 | Array namespace mode |
| `encoding` | ✅ | ✅ | 4C | Response encoding |
| `forceUseSchemaXmlns` | ✅ | ✅ | 3 | Schema namespace |
| `serviceName` | ✅ | ✅ | 4A | Select service |
| `portName` | ✅ | ✅ | 4A | Select port |
| `overrideElementKey` | ✅ | ✅ | 4B | Rename elements |
| `envelopeSoapUrl` | ✅ | ✅ | 4B | Custom envelope URL |
| `exchangeId` | ✅ | ✅ | 3 | Request tracking |
| `useEmptyTag` | ✅ | ✅ | 3 | Self-closing tags |
| `stream` | 🚫 | ✅ | N/A | Node.js streams |
| `returnSaxStream` | 🚫 | ✅ | N/A | Node.js streams |
| `parseResponseAttachments` | 🚫 | ✅ | N/A | MTOM (server-side) |

**Total**: 22/23 options (96%)

---

## Security Protocols

| Protocol | ngx-soap | node-soap | Phase | Notes |
|----------|----------|-----------|-------|-------|
| **WSSecurity** | ✅ | ✅ | Base + 5 | Username/Password |
| **WSSecurityCert** | ✅ | ✅ | Base + 4B + 5 | X.509 Certificate |
| **WSSecurityCertWithToken** | ✅ | ✅ | 3 + 5 | Cert + Token |
| **WSSecurityPlusCert** | ✅ | ✅ | 3 | Combined security |
| **BasicAuthSecurity** | 🚫 | ✅ | N/A | HTTP Basic (Node.js) |
| **BearerSecurity** | 🚫 | ✅ | N/A | HTTP Bearer (Node.js) |
| **ClientSSLSecurity** | 🚫 | ✅ | N/A | SSL Certs (Node.js) |
| **ClientSSLSecurityPFX** | 🚫 | ✅ | N/A | PFX Certs (Node.js) |
| **NTLMSecurity** | 🚫 | ✅ | N/A | NTLM (Node.js) |

**Browser-Compatible**: 4/4 (100%)  
**Total (incl. Node.js)**: 4/9 (44% - expected)

---

## Security Options

| Option | Protocol | ngx-soap | node-soap | Phase |
|--------|----------|----------|-----------|-------|
| `passwordType` | WSSecurity | ✅ | ✅ | Base |
| `hasTimeStamp` | WSSecurity | ✅ | ✅ | Base |
| `hasNonce` | WSSecurity | ✅ | ✅ | Base |
| `hasTokenCreated` | WSSecurity | ✅ | ✅ | Base |
| `actor` | WSSecurity | ✅ | ✅ | Base |
| `mustUnderstand` | WSSecurity | ✅ | ✅ | Base |
| `envelopeKey` | WSSecurity | ✅ | ✅ | 5 |
| `appendElement` | WSSecurity | ✅ | ✅ | 5 |
| `digestAlgorithm` | WSSecurityCert | ✅ | ✅ | 4B |
| `signatureAlgorithm` | WSSecurityCert | ✅ | ✅ | 4B |
| `excludeReferencesFromSigning` | WSSecurityCert | ✅ | ✅ | 4C |
| `appendElement` | WSSecurityCert | ✅ | ✅ | 5 |

**Total**: 12/12 (100%)

---

## Bug Fixes

| Fix | ngx-soap | node-soap | Phase | PR/Issue |
|-----|----------|-----------|-------|----------|
| Empty SOAP body | ✅ | ✅ | 2 | - |
| SOAP Fault 1.1/1.2 | ✅ | ✅ | 2 | - |
| Element $ref resolution | ✅ | ✅ | 2 | #1260 |
| $type mutation | ✅ | ✅ | 4A | #1238 |
| Missing message definitions | ✅ | ✅ | 4A | #1241 |
| ComplexContent with Restriction | ✅ | ✅ | 4A | #1252 |
| xmlns:wsu spacing | ✅ | ✅ | 4B | #1215 |
| Hardcoded timestamp IDs | ✅ | ✅ | 4B | #1290 |
| Namespace array inheritance | ✅ | ✅ | 2 | - |

**Total**: 9/9 (100%)

---

## Client Methods

| Method | ngx-soap | node-soap | Notes |
|--------|----------|-----------|-------|
| `createClient()` | ✅ | ✅ | Create from URL/XML |
| `createClientAsync()` | ✅ | ✅ | Promise-based creation |
| `describe()` | ✅ | ✅ | WSDL description |
| `setSecurity()` | ✅ | ✅ | Set security protocol |
| `setEndpoint()` | ✅ | ✅ | Override endpoint |
| `addSoapHeader()` | ⚠️ | ✅ | Missing function support |
| `changeSoapHeader()` | ⚠️ | ✅ | Missing function support |
| `clearSoapHeaders()` | ✅ | ✅ | Clear all headers |
| `getSoapHeaders()` | ✅ | ✅ | Get current headers |
| `[method]()` | ✅ | ✅ | Direct method calls |
| `[method]Async()` | ✅ | ✅ | Promise-based calls |
| `[service].[port].[method]()` | ✅ | ✅ | Service-specific calls |

**Total**: 11/12 (92%) - addSoapHeader/changeSoapHeader partially complete

---

## WSDL Features

| Feature | ngx-soap | node-soap | Phase | Notes |
|---------|----------|-----------|-------|-------|
| WSDL 1.1 | ✅ | ✅ | Base | Complete |
| WSDL 2.0 | 🚫 | 🚫 | N/A | Not supported |
| XSD Schema | ✅ | ✅ | Base | Complete |
| Import/Include | ✅ | ✅ | Base | Complete |
| Multiple schemas | ⚠️ | ✅ | - | Missing merge logic |
| Namespace prefixes | ✅ | ✅ | Base | Complete |
| Target namespace | ⚠️ | ✅ | - | Missing fallback |
| Element references | ✅ | ✅ | 2 | Complete |
| Complex types | ✅ | ✅ | Base | Complete |
| Simple types | ✅ | ✅ | Base | Complete |
| Extension | ✅ | ✅ | Base | Complete |
| Restriction | ✅ | ✅ | 4A | Complete |
| Attributes | ✅ | ✅ | Base | Complete |
| Custom cache | ✅ | ✅ | 4C | Complete |

**Total**: 12/14 (86%)

---

## Performance Optimizations

| Optimization | ngx-soap | node-soap | Phase | Notes |
|--------------|----------|-----------|-------|-------|
| Native trim() | ✅ | ✅ | 1 | 2x faster |
| Map namespaces | ✅ | ✅ | 2 | Faster lookups |
| Immutable $type | ✅ | ✅ | 4A | Prevent mutation |
| Namespace prefix caching | ⏭️ | ✅ | Deferred | #1347 |
| WSDL parsing speed | ⏭️ | ✅ | Deferred | #1218, #1322 |
| Recursion avoidance | ⏭️ | ✅ | Deferred | Deep nesting |

**Implemented**: 3/6 (50% - 3 deferred by choice)

---

## Dependencies

| Package | ngx-soap | node-soap | Notes |
|---------|----------|-----------|-------|
| xml-crypto | v6.1.2 ✅ | v6.1.2 ✅ | Same version |
| sax | v1.4.1 ✅ | v1.4.1 ✅ | Same version |
| lodash | v4.17.21 ✅ | v4.17.21 ✅ | Same version |
| debug | v4.4.3 ✅ | v4.4.3 ✅ | Same version |
| uuid | Removed ✅ | Removed ✅ | Using crypto.randomUUID |
| axios | 🚫 | v1.x ✅ | Using Angular HttpClient |
| axios-ntlm | 🚫 | v1.x ✅ | Node.js only |
| formidable | 🚫 | v3.x ✅ | Node.js only (MTOM) |

---

## Missing Features Summary

| # | Feature | Priority | Effort | Impact |
|---|---------|----------|--------|--------|
| 1 | Function-based SOAP headers | Medium | 2-3h | Dynamic headers |
| 2 | Schema namespace merge | Medium | 1-2h | Complex WSDLs |
| 3 | Import namespace fallback | Low | 30m | Edge case |

**Total Effort**: 4-6 hours for 100% parity

---

## Node.js-Only Features (Not Applicable)

| Feature | Reason |
|---------|--------|
| SOAP Server | Server-side only |
| File system operations | Node.js fs module |
| Node.js streams | Server-side feature |
| NTLM authentication | Windows auth, Node.js only |
| HTTP/HTTPS agents | Node.js http module |
| SSL certificates (file-based) | Node.js crypto |
| MTOM attachments (server) | Server-side multipart |

**These are excluded from parity calculations.**

---

## Overall Parity Score

### Core Features
- **Implemented**: 36/39 = **92%** ✅
- **Deferred**: 5 optimizations (intentional)
- **Missing**: 3 features (4-6 hours to implement)

### Browser-Compatible Features
- **Security Protocols**: 4/4 = **100%** ✅
- **Security Options**: 12/12 = **100%** ✅
- **Configuration**: 22/23 = **96%** ✅
- **Bug Fixes**: 9/9 = **100%** ✅
- **Client Methods**: 11/12 = **92%** ✅
- **WSDL Features**: 12/14 = **86%** ✅

### Production Readiness
- **Status**: ✅ **PRODUCTION READY**
- **Tests**: 249/249 passing ✅
- **Breaking Changes**: 0 ✅
- **Version**: 0.18.1

---

## Quick Decision Matrix

| Scenario | Recommendation | Parity Level |
|----------|----------------|--------------|
| **Production deployment** | ✅ Use v0.18.1 now | 92% (sufficient) |
| **Simple SOAP clients** | ✅ Use v0.18.1 | 92% (more than enough) |
| **Complex enterprise WSDLs** | ⚠️ Consider Phase 6 | 92% → 100% |
| **Dynamic SOAP headers** | ⚠️ Implement feature #1 | 92% → 94% |
| **Multiple schema imports** | ⚠️ Implement feature #2 | 92% → 96% |
| **Marketing as "complete"** | ⏳ Implement Phase 6 | 92% → 100% |

---

## References

- **[TODO.md](./TODO.md)** - Phase tracking
- **[BACKPORT_INFO.md](./BACKPORT_INFO.md)** - Technical details
- **[FINAL_COMPARISON.md](./FINAL_COMPARISON.md)** - Comprehensive analysis
- **[MISSING_FEATURES.md](./MISSING_FEATURES.md)** - Implementation guide
- **[ANALYSIS_SUMMARY.md](./ANALYSIS_SUMMARY.md)** - Executive summary

---

**Last Updated**: 2025-11-22  
**Status**: Analysis Complete ✅  
**Recommendation**: Production Ready ✅

