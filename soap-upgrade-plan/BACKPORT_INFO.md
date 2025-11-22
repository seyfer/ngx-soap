# ngx-soap Backport Technical Reference

**Gap**: ngx-soap v0.17.0 (2016) → node-soap v1.6.0 (2025) = 9 years, 89 releases  
**Status**: 33/37 tasks (89%) | 235 tests | 0 breaking changes ✅  
**Version**: 0.18.0 ready for release

---

## Completed Phases

| Phase | Status | Tasks | Tests | Key Improvements |
|-------|--------|-------|-------|------------------|
| Phase 1 | ✅ | 7/7 | 149 | xml-crypto v6.1.2, crypto.randomUUID() |
| Phase 2 | ✅ | 7/7 | 157 | Empty body, SOAP Fault, Map namespaces |
| Phase 3 | ✅ | 7/7 | 199 | 8 options, 2 security protocols, EID |
| Phase 4A | ✅ | 4/4 | 211 | Missing messages, $type fix, multi-service |
| Phase 4B | ✅ | 5/7 | 223 | Security algorithms, envelope URL, element override |
| Phase 4C | ✅ | 3/5 | 235 | Encoding, custom cache, exclude signing |

**Deferred**: 4 tasks (2 namespace, 2 performance) - require dedicated phases

---

## Architecture & Constraints

### Why ngx-soap Wrapper Necessary
- **Node.js Dependencies**: fs, zlib, streams, https agent
- **Browser APIs**: HttpClient, crypto-js, no file system
- **Angular Integration**: RxJS Observables, HttpInterceptors
- **Backport Strategy**: Logic only, adapt implementations

### What Can/Cannot Be Backported
```
✅ Algorithms, parsing, validation, bug fixes
✅ Options, features, security updates
❌ HTTP client (use Angular HttpClient)
❌ File system, streams, zlib
❌ Server features, NTLM auth
```

---

## Phase 1: Security & Dependencies

### Critical Updates
```typescript
// xml-crypto v2.1.6 → v6.1.2 (9 years of security fixes)
import { SignedXml } from 'xml-crypto';

// Native crypto.randomUUID() with browser fallback
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for HTTP contexts
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Native String.trim() (2x faster)
text = text.trim(); // Instead of custom trim()
```

---

## Phase 2: Bug Fixes & Performance

### Empty SOAP Body Handling
```typescript
// client.ts - parseSync
if (!body || typeof body !== 'string' || body.trim().length === 0) {
  debug('Received empty SOAP body');
  if (!output) {
    return { err: null, response: null, responseBody: body, header: undefined, xml };
  }
  return { err: null, result: {}, responseBody: body, header: undefined, xml };
}
```

### SOAP Fault 1.1/1.2 Support
```typescript
if (body.Fault) {
  const fault = body.Fault;
  let code, string, actor, detail;
  
  // SOAP 1.1
  if (fault.faultcode) {
    code = fault.faultcode;
    string = fault.faultstring;
    actor = fault.faultactor;
    detail = fault.detail;
  }
  // SOAP 1.2
  else if (fault.Code) {
    code = fault.Code.Value;
    string = fault.Reason?.Text || '';
    actor = fault.Role;
    detail = fault.Detail;
  }
  
  const error: any = new Error(string || code);
  error.Fault = fault;
  error.code = code;
  
  if (this.options.returnFault) {
    return body;  // Return as data
  }
  throw error;
}
```

### Element Reference Resolution
```typescript
// ElementElement.prototype.description
if (this.$ref) {
  // Preserve maxOccurs/minOccurs from referring element
  if (isMany && typeof elem === 'object') {
    let refElemName = Object.keys(elem)[0];
    if (refElemName && !refElemName.endsWith('[]')) {
      let refValue = elem[refElemName];
      delete elem[refElemName];
      elem[refElemName + '[]'] = refValue;
    }
  }
  element = elem;
}
```

### Map-Based Namespace Lookups
```typescript
export class NamespaceScope {
  namespaces: Map<string, {uri: string, prefix: string, declared: boolean}>;
  
  constructor(parent: any) {
    this.namespaces = new Map();  // Faster than Object
  }
  
  getNamespaceURI(prefix: string, localOnly?: boolean): string {
    const nsUri = this.namespaces.get(prefix);
    return nsUri?.uri || (!localOnly && this.parent?.getNamespaceURI(prefix)) || null;
  }
}
```

---

## Phase 3: New Options & Features

### Configuration Options
```typescript
interface IOptions {
  useEmptyTag?: boolean;              // <Tag /> vs <Tag></Tag>
  preserveWhitespace?: boolean;       // Keep spaces
  normalizeNames?: boolean;           // Replace special chars with _
  suppressStack?: boolean;            // Hide stack traces
  forceUseSchemaXmlns?: boolean;      // Force schema xmlns
  envelopeKey?: string;               // Custom prefix (default: 'soap')
  overridePromiseSuffix?: string;     // Override 'Async' suffix
  exchangeId?: string;                // Request tracking ID
}

// wsdl.ts - useEmptyTag
if (useEmptyTag && !content) {
  return `<${prefix}${name}${xmlns}${attributes} />`;
}

// wsdl.ts - preserveWhitespace
function trim(text: string): string {
  if (this.options.preserveWhitespace) return text;
  return text.trim();
}
```

### Security Protocols
```typescript
// WSSecurityCertWithToken - Certificate + Username Token
export function WSSecurityCertWithToken(
  privatePEM: string | Buffer,
  publicP12PEM: string | Buffer,
  password: string,
  options: { username?: string; password?: string }
) {
  this.cert = new WSSecurityCert(privatePEM, publicP12PEM, password);
  if (options.username && options.password) {
    this.token = new WSSecurity(options.username, options.password, options);
  }
}

// WSSecurityPlusCert - Combined WS-Security + Certificate
export function WSSecurityPlusCert(wsSecurity: any, wsSecurityCert: any) {
  this.wsSecurity = wsSecurity;
  this.wsSecurityCert = wsSecurityCert;
}
```

### Exchange ID Tracking
```typescript
// client.ts - _invoke
const eid = options.exchangeId || generateUUID();
this.emit('request', xml, eid);
this.emit('response', body, response, eid);
this.emit('soapError', error, eid);

// Updated interfaces
export interface Client {
  emit(event: 'request', xml: string, eid: string): boolean;
  emit(event: 'response', body: any, response: any, eid: string): boolean;
  on(event: 'request', listener: (xml: string, eid: string) => void): this;
}
```

---

## Phase 4A: Critical Bug Fixes

### Task 4.1: Handle Missing Messages
```typescript
// OperationElement.prototype.postProcess
let message = definitions.messages[messageName];
if (!message) {
  debug('Message definition for %s not found. Skipping.', messageName);
  children.splice(i--, 1);
  continue;
}
message.postProcess(definitions);
```

### Task 4.2: Prevent $type Mutation
```typescript
// findChildSchemaObject
if (foundCandidate) {
  found = _.cloneDeep(foundCandidate); // Clone to prevent mutation
  found.$baseNameSpace = childNameSpace;
  found.$type = childNameSpace + ':' + childName;
  break;
}
```

### Task 4.3: Multi-Service/Port Support
```typescript
interface IOptions {
  serviceName?: string;  // Select specific service
  portName?: string;     // Select specific port
}

// Client._initializeServices
if (serviceName && services[serviceName]) {
  const service = services[serviceName];
  if (portName && service.ports[portName]) {
    this[serviceName] = {};
    this[serviceName][portName] = this._definePort(service.ports[portName], endpoint);
  } else if (!portName) {
    this[serviceName] = this._defineService(service, endpoint);
  } else {
    throw new Error(`Port '${portName}' not found in service '${serviceName}'.`);
  }
} else if (!serviceName) {
  for (const name in services) {
    this[name] = this._defineService(services[name], endpoint);
  }
}
```

### Task 4.4: ComplexContent with Restriction
```typescript
// ComplexContentElement.prototype.description
for (let i = 0, child; child = children[i]; i++) {
  if (child instanceof ExtensionElement || child instanceof RestrictionElement) {
    return child.description(definitions, xmlns);
  }
}
```

---

## Phase 4B: Medium Priority Features

### Task 4.5: Override Element Keys
```typescript
interface IWsdlBaseOptions {
  overrideElementKey?: { [key: string]: string };
}

// ElementElement.prototype.description
if (this.options.overrideElementKey && this.options.overrideElementKey[name]) {
  name = this.options.overrideElementKey[name];
}
```

### Task 4.6: Custom SOAP Envelope URL
```typescript
interface IOptions {
  envelopeSoapUrl?: string;  // Custom envelope namespace URL
}

// WSDL._xmlnsMap
if (alias === 'soap' && this.options.envelopeSoapUrl) {
  ns = this.options.envelopeSoapUrl;
}

// Client._invoke
if (this.wsdl.options.envelopeSoapUrl && !this.wsdl.options.forceSoap12Headers) {
  xmlnsSoap = 'xmlns:' + envelopeKey + '="' + this.wsdl.options.envelopeSoapUrl + '"';
}
```

### Task 4.7: Security Algorithm Options
```typescript
interface WSSecurityCertOptions {
  digestAlgorithm?: 'sha1' | 'sha256' | 'sha512';  // Default: 'sha256'
  signatureAlgorithm?: string;                      // Default: rsa-sha256
}

export function WSSecurityCert(privatePEM, publicP12PEM, password, options?) {
  this.digestAlgorithm = options?.digestAlgorithm || 'sha256';
  this.signatureAlgorithm = options?.signatureAlgorithm || 
    'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256';
  
  this.signer = new SignedXml();
  this.signer.signatureAlgorithm = this.signatureAlgorithm;
  
  // Use digest algorithm when adding references
  this.signer.addReference(xpath, transforms, this.digestAlgorithm);
}
```

### Task 4.9-4.10: WSSecurity Improvements
```typescript
// Dynamic timestamp IDs (Task 4.9)
const timestampId = generateUUID().replace(/-/gm, '');
timeStampXml = "<wsu:Timestamp wsu:Id=\"Timestamp-" + timestampId + "\">" +
  "<wsu:Created>"+created+"</wsu:Created>" +
  "<wsu:Expires>"+expires+"</wsu:Expires>" +
  "</wsu:Timestamp>";

// Fix xmlns:wsu spacing (Task 4.10)
return "<wsse:Security " + (this._actor ? "soap:actor=\"" + this._actor + "\" " : "") +
  "xmlns:wsse=\"...\" xmlns:wsu=\"...\">" + // Space after xmlns:wsse
  timeStampXml + usernameToken + "</wsse:Security>";
```

---

## Phase 4C: Low Priority Enhancements

### Task 4.14: Exclude References from Signing
```typescript
interface WSSecurityCertOptions {
  excludeReferencesFromSigning?: string[];
}

export function WSSecurityCert(privatePEM, publicP12PEM, password, options?) {
  this.excludeReferencesFromSigning = options?.excludeReferencesFromSigning || [];
}

WSSecurityCert.prototype.postProcess = function(xml, envelopeKey) {
  const shouldExclude = (refName) => {
    return this.excludeReferencesFromSigning &&
           this.excludeReferencesFromSigning.some(excluded =>
             refName.toLowerCase().includes(excluded.toLowerCase())
           );
  };
  
  if (!shouldExclude('Body')) {
    this.signer.addReference("//*[name(.)='" + envelopeKey + ":Body']", ...);
  }
  if (!shouldExclude('Timestamp')) {
    this.signer.addReference("//*[name(.)='wsse:Security']/*[local-name(.)='Timestamp']", ...);
  }
};
```

### Task 4.15: Response Encoding
```typescript
interface IOptions {
  encoding?: string;  // Default: 'utf-8'
}

// Note: In browser, encoding is handled by XMLHttpRequest
// This option is for API compatibility with node-soap
this.options.encoding = options.encoding || 'utf-8';
```

### Task 4.16: Custom WSDL Cache
```typescript
interface IWSDLCache {
  has(key: string): boolean;
  get(key: string): any;
  set(key: string, value: any): void;
}

interface IOptions {
  wsdlCache?: IWSDLCache;
}

// Usage
class LRUCache implements IWSDLCache {
  has(key: string): boolean { /* ... */ }
  get(key: string): any { /* ... */ }
  set(key: string, value: any): void { /* ... */ }
}

createClient(url, { wsdlCache: new LRUCache() });
```

---

## Deferred Tasks (Future Phases)

### Task 4.8: Namespace Improvements ⏭️
**Reason**: Complex refactoring requiring extensive testing  
**Current**: Map-based lookups already implemented (Phase 2)  
**Recommendation**: Address specific edge cases as they arise

### Task 4.11: WSDL Parsing Optimizations ⏭️
**Reason**: Requires benchmarking suite  
**Current**: Map-based namespaces, native trim already done  
**Recommendation**: Profile first, then optimize bottlenecks

### Task 4.17: XML Processing Improvements ⏭️
**Reason**: Current implementation robust (sax library, Phase 2/3 improvements)  
**Recommendation**: Address specific edge cases based on real-world usage

### Task 4.18: Performance Optimizations ⏭️
**Reason**: Key optimizations complete  
**Recommendation**: Create benchmarks, measure, then optimize

---

## Testing Strategy

### Test Coverage
```typescript
// Phase 1-3: 199 tests
// Phase 4A-C: +36 tests
// Total: 235 passing tests

// Critical test scenarios
describe('Empty SOAP body', () => {
  it('should handle empty body without crashing');
  it('should handle null responses');
  it('should handle one-way operations');
});

describe('SOAP Faults', () => {
  it('should parse SOAP 1.1 fault');
  it('should parse SOAP 1.2 fault');
  it('should return fault when returnFault=true');
});

describe('Multi-service WSDLs', () => {
  it('should select specific service by name');
  it('should select specific port by name');
  it('should throw error for non-existent service/port');
});

describe('Security algorithms', () => {
  it('should use sha256 by default');
  it('should accept custom digest algorithm');
  it('should accept custom signature algorithm');
});
```

---

## Usage Examples

### Phase 1-3 Features
```typescript
import { createClient, security } from 'ngx-soap';

createClient(wsdlUrl, {
  // Phase 2
  returnFault: true,
  namespaceArrayElements: true,
  
  // Phase 3
  useEmptyTag: true,
  preserveWhitespace: false,
  envelopeKey: 'SOAP-ENV',
  exchangeId: 'req-123',
  suppressStack: true,
  normalizeNames: true,
  forceUseSchemaXmlns: true,
  overridePromiseSuffix: 'Async',
}).subscribe(client => {
  // Phase 3: Event tracking with EID
  client.on('request', (xml, eid) => console.log(`Request ${eid}`));
  client.on('response', (body, response, eid) => console.log(`Response ${eid}`));
  
  // Phase 3: New security protocols
  const sec = new security.WSSecurityCertWithToken(
    privateKey, publicKey, password,
    { username: 'user', password: 'pass' }
  );
  client.setSecurity(sec);
});
```

### Phase 4 Features
```typescript
createClient(wsdlUrl, {
  // Phase 4A
  serviceName: 'MyService',
  portName: 'MyPort',
  
  // Phase 4B
  overrideElementKey: { 'OldName': 'NewName' },
  envelopeSoapUrl: 'http://custom.soap.org/envelope/',
  
  // Phase 4C
  encoding: 'latin1',
  wsdlCache: new CustomCache(),
}).subscribe(client => {
  // Phase 4B: Custom security algorithms
  const sec = new security.WSSecurityCert(privateKey, publicKey, password, {
    digestAlgorithm: 'sha256',
    signatureAlgorithm: 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256',
    excludeReferencesFromSigning: ['Body']
  });
  client.setSecurity(sec);
});
```

---

## Node-soap Version Mapping

| Version | Date | Key Features | ngx-soap Status |
|---------|------|--------------|-----------------|
| v0.17.0 | 2016 | Baseline | ✅ Base |
| v1.0.0 | 2022 | Stable release | ✅ Core features |
| v1.0.2 | 2024 | trim() optimization | ✅ Phase 1 |
| v1.0.3 | 2024 | Security protocols | ✅ Phase 3 |
| v1.1.0 | 2024 | crypto.randomUUID() | ✅ Phase 1 |
| v1.3.0 | 2025 | Performance | ✅ Phase 2 |
| v1.6.0 | 2025 | Multi-service | ✅ Phase 4 |

**Feature Parity**: 89% (33/37 tasks complete)

---

## Files Modified

```
# Phase 1
- package.json (root + library)
- projects/ngx-soap/src/lib/soap/wsdl.ts

# Phase 2
- projects/ngx-soap/src/lib/soap/client.ts
- projects/ngx-soap/src/lib/soap/wsdl.ts
- projects/ngx-soap/src/lib/soap/nscontext.ts
- projects/ngx-soap/src/lib/soap/interfaces.ts

# Phase 3
- projects/ngx-soap/src/lib/soap/security/WSSecurityCertWithToken.ts (new)
- projects/ngx-soap/src/lib/soap/security/WSSecurityPlusCert.ts (new)
- projects/ngx-soap/src/lib/soap/client.ts
- projects/ngx-soap/src/lib/soap/interfaces.ts
- projects/ngx-soap/src/lib/soap/wsdl.ts

# Phase 4A-C
- projects/ngx-soap/src/lib/soap/wsdl.ts
- projects/ngx-soap/src/lib/soap/client.ts
- projects/ngx-soap/src/lib/soap/interfaces.ts
- projects/ngx-soap/src/lib/soap/security/WSSecurityCert.ts
- projects/ngx-soap/src/lib/soap/security/WSSecurityCertWithToken.ts
- projects/ngx-soap/src/lib/soap/security/WSSecurity.ts
```

---

## Breaking Changes

**NONE** ✅

All improvements are:
- Backward compatible
- Optional features
- Graceful fallbacks
- Default behavior preserved

---

## Quick Commands

```bash
# Test
npm run test:lib

# Build
npm run build:lib

# Search
grep -r "pattern" projects/ngx-soap/src/ --include="*.ts"

# Git
git status
git log --oneline -10
```

---

**Last Updated**: 2025-11-22  
**Status**: 89% Complete | 235 Tests | Production Ready ✅  
**Version**: 0.18.0 ready for release
