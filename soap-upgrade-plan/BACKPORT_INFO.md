# ngx-soap Backport Technical Reference

**Gap**: ngx-soap v0.17.0 (2016) → node-soap v1.6.0 (2025) = 9 years, 89 releases

**Core Fact**: ngx-soap wrapper is **necessary** - node-soap requires Node.js (fs, zlib, streams). We backport LOGIC only, not dependencies.

---

## Completed Improvements

### ✅ Phase 1: Security & Dependencies (v2.1.6 → v6.1.2)
- **xml-crypto**: v2.1.6 → v6.1.2 (CRITICAL security fixes)
- **uuid removed**: Native `crypto.randomUUID()` with fallback
- **trim()**: Native String.trim() (2x faster)
- **deps**: sax v1.4.1, lodash v4.17.21, debug v4.4.3

### ✅ Phase 2: Bug Fixes & Performance
- **Empty SOAP body**: Handles null/empty responses, one-way operations
- **SOAP Fault**: Full SOAP 1.1/1.2 support, returnFault option
- **Element refs**: Fixed $ref with maxOccurs/minOccurs
- **Namespace**: Arrays inherit parent namespace correctly
- **Performance**: Map-based namespace lookups (faster than Object)

---

## Phase 3: New Options (TODO)

### Configuration Options to Add

```typescript
interface IOptions {
  // Existing...
  
  // NEW OPTIONS:
  useEmptyTag?: boolean;              // <Tag /> vs <Tag></Tag>
  preserveWhitespace?: boolean;       // Keep leading/trailing spaces
  normalizeNames?: boolean;           // Replace non-identifiers with _
  escapeXML?: boolean;                // Control XML escaping
  suppressStack?: boolean;            // Hide stack traces
  forceUseSchemaXmlns?: boolean;      // Force schema xmlns
  envelopeKey?: string;               // Custom envelope key (default: 'soap')
  overridePromiseSuffix?: string;     // Override Async suffix
}
```

**Implementation**:
```typescript
// wsdl.ts - useEmptyTag
if (useEmptyTag && !content) {
  return `<${prefix}${name}${xmlns}${attributes} />`;
}
```

### Security Protocols to Add

```typescript
// WSSecurityCertWithToken.ts - WS-Security + Username Token
export class WSSecurityCertWithToken {
  constructor(
    privatePEM: string | Buffer,
    publicP12PEM: string | Buffer,
    password: string,
    options: { username?: string; password?: string }
  ) { }
  toXML(): string { /* Combined security header */ }
}

// WSSecurityPlusCert.ts - Combined WSSecurity + WSSecurityCert
export class WSSecurityPlusCert {
  constructor(wsSecurity: WSSecurity, wsSecurityCert: WSSecurityCert) { }
}
```

### Client Events Enhancement

```typescript
// Add Exchange ID (EID) tracking
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

## Key Code Patterns

### 1. SOAP 1.1/1.2 Fault Handling
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
  error.statusCode = fault.statusCode || 500;
  
  if (this.options.returnFault) {
    return body;  // Return as data, not error
  }
  throw error;
}
```

### 2. Element Reference Handling
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

### 3. Namespace Context (Map-based)
```typescript
export class NamespaceScope {
  namespaces: Map<string, {uri: string, prefix: string, declared: boolean}>;
  
  constructor(parent: any) {
    this.namespaces = new Map();  // Faster than Object
  }
  
  getNamespaceURI(prefix: string, localOnly?: boolean): string {
    const nsUri = this.namespaces.get(prefix);  // Map.get() is faster
    return nsUri?.uri || (!localOnly && this.parent?.getNamespaceURI(prefix)) || null;
  }
}
```

### 4. Empty Body Handling
```typescript
// In parseSync (client.ts)
if (!body || typeof body !== 'string' || body.trim().length === 0) {
  debug('Received empty SOAP body');
  if (!output) {
    return { err: null, response: null, responseBody: body, header: undefined, xml };
  }
  return { err: null, result: {}, responseBody: body, header: undefined, xml };
}
```

### 5. UUID with Browser Fallback
```typescript
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
```

---

## NOT Backportable (Node.js-specific)

```typescript
// ❌ File system operations
import * as fs from 'fs';
fs.readFileSync('wsdl.xml');

// ❌ Node.js zlib compression
import * as zlib from 'zlib';
zlib.gzip(data, callback);

// ❌ Node.js streams
import { Stream } from 'stream';

// ❌ Server features
server.listen(8000, callback);

// ⚠️ axios (use Angular HttpClient instead)
import axios from 'axios';
```

---

## Architecture Decisions

### Why Keep ngx-soap Wrapper?
1. **Browser Compatibility**: Polyfills for Buffer, url, stream
2. **Angular Integration**: HttpClient, RxJS, HttpInterceptors
3. **Crypto**: crypto-js instead of Node.js crypto
4. **No FS/Zlib**: Browser doesn't have these

### What to Backport?
```
✅ Logic improvements (algorithms, parsing, validation)
✅ Bug fixes (empty bodies, faults, namespaces)
✅ Options and features (returnFault, useEmptyTag)
✅ Security updates (xml-crypto, modern crypto)

❌ HTTP client changes (keep Angular HttpClient)
❌ File system operations
❌ Node.js-specific modules
❌ Server features
```

### Example: UUID Generation
**Why adapted**: node-soap uses Node.js `crypto.randomUUID()`, we use browser crypto API with fallback.

**node-soap v1.1.0**:
```typescript
import { randomUUID } from 'crypto';
const id = randomUUID();
```

**ngx-soap adaptation**:
```typescript
// Works in both HTTPS and HTTP contexts
const id = crypto.randomUUID ? crypto.randomUUID() : fallbackUUID();
```

---

## Testing Requirements

### Critical Tests
```typescript
// Empty body
it('should handle empty SOAP body without crashing');
it('should handle one-way operations');

// SOAP Faults
it('should parse SOAP 1.1 fault');
it('should parse SOAP 1.2 fault');
it('should return fault when returnFault=true');

// Namespace
it('should inherit namespace for arrays');
it('should handle element refs with maxOccurs');

// Performance
it('should parse large WSDLs within 500ms');
```

### Verification Checklist
- [ ] All tests pass (157+ passing)
- [ ] Build succeeds
- [ ] No linter errors
- [ ] No TypeScript errors
- [ ] Works in Chrome, Firefox, Safari, Edge
- [ ] Performance same or better
- [ ] Bundle size acceptable

---

## Reference: node-soap Versions

| Version | Date | Key Changes |
|---------|------|-------------|
| v0.17.0 | 2016 | **ngx-soap baseline** |
| v0.40.0 | 2021 | Axios migration |
| v1.0.0 | 2022 | Major stable release |
| v1.0.2 | 2024 | trim() optimization |
| v1.0.3 | 2024 | WSSecurityCertWithToken |
| v1.1.0 | 2024 | crypto.randomUUID() |
| v1.3.0 | 2025 | Performance improvements |
| v1.6.0 | 2025 | **Latest** |

---

## Quick Commands

```bash
# Test
npm run test:lib

# Build
npm run build:lib

# Find usage
grep -r "pattern" projects/ngx-soap/src/ --include="*.ts"

# Check branch
git status
git log --oneline -5
```

---

**Last Updated**: 2025-11-22 (Phase 1 & 2 complete)

