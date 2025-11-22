# ngx-soap Backport TODO

**Branch**: `update-node-soap`  
**Status**: Phase 1 ✅ | Phase 2 ✅ | Phase 3 ⏳

---

## ✅ PHASE 1: Security & Dependencies (COMPLETE)

**Commits**: `e5969d7`  
**Tests**: 149 passing  
**Build**: ✅ Success

### Completed Tasks
- [x] xml-crypto: v2.1.6 → v6.1.2 (CRITICAL)
- [x] uuid removed, replaced with crypto.randomUUID()
- [x] trim() optimized (native String.trim())
- [x] sax: v1.4.1, lodash: v4.17.21
- [x] debug package added (wsdl.ts, client.ts, http.ts)
- [x] package.json (root + library) updated
- [x] All tests passing

---

## ✅ PHASE 2: Bug Fixes & Performance (COMPLETE)

**Commits**: `b8c1fc3`  
**Tests**: 157 passing (8 new)  
**Build**: ✅ Success

### Completed Tasks
- [x] Empty SOAP body handling (null/undefined/empty checks)
- [x] SOAP Fault handling (1.1 + 1.2 support, returnFault option)
- [x] Element reference handling ($ref with maxOccurs/minOccurs)
- [x] Namespace handling (arrays inherit parent namespace)
- [x] Performance optimization (Map-based namespace lookups)
- [x] Test specs added (3 empty body, 5 SOAP fault)
- [x] All files modified (6), tests passing

### Files Modified
```
projects/ngx-soap/src/lib/soap/client.ts
projects/ngx-soap/src/lib/soap/wsdl.ts
projects/ngx-soap/src/lib/soap/nscontext.ts
projects/ngx-soap/src/lib/soap/interfaces.ts
projects/ngx-soap/test/soap/client-operations.spec.ts
projects/ngx-soap/test/soap/wsdl.spec.ts
```

---

## ⏳ PHASE 3: New Options & Features (TODO)

**Priority**: MEDIUM  
**Risk**: Low  
**Estimated Time**: 2-3 weeks

---

### Task 3.1: Add Configuration Options

**File**: `projects/ngx-soap/src/lib/soap/interfaces.ts`

**Options to Add**:
```typescript
export interface IOptions {
  // Phase 1 & 2 added:
  returnFault?: boolean;              // ✅ Done
  namespaceArrayElements?: boolean;   // ✅ Done
  
  // TODO - Add these:
  useEmptyTag?: boolean;              // <Tag /> vs <Tag></Tag>
  preserveWhitespace?: boolean;       // Keep spaces in trim()
  normalizeNames?: boolean;           // Replace non-ident chars with _
  escapeXML?: boolean;                // Control XML escaping
  suppressStack?: boolean;            // Hide stack traces in errors
  forceUseSchemaXmlns?: boolean;      // Force schema xmlns usage
  envelopeKey?: string;               // Custom envelope key (default: 'soap')
  overridePromiseSuffix?: string;     // Override Async suffix
}
```

**Steps**:
1. Add options to IOptions interface with JSDoc
2. Initialize in WSDL constructor with defaults
3. Implement in objectToXML (useEmptyTag, preserveWhitespace)
4. Implement in _invoke (normalizeNames, envelopeKey)
5. Add tests for each option
6. Update README with examples

**Verification**:
- [ ] All options in IOptions
- [ ] JSDoc documentation added
- [ ] Options work as expected
- [ ] Tests pass for each option
- [ ] README updated

**Example Implementation**:
```typescript
// wsdl.ts - useEmptyTag
if (useEmptyTag && !content) {
  return `<${prefix}${name}${xmlns}${attributes} />`;
}
return `<${prefix}${name}${xmlns}${attributes}>${content}</${prefix}${name}>`;

// wsdl.ts - preserveWhitespace
function trim(text: string): string {
  if (this.options.preserveWhitespace) {
    return text;
  }
  return text.trim();
}

// client.ts - normalizeNames
if (this.options.normalizeNames) {
  methodName = methodName.replace(/[^a-z$_0-9]/gi, '_');
}

// client.ts - envelopeKey
const envelopeKey = this.wsdl.options.envelopeKey || 'soap';
xml = `<${envelopeKey}:Envelope>...`;
```

---

### Task 3.2: Add Enhanced Security Protocols

**Files to Create**:
- `projects/ngx-soap/src/lib/soap/security/WSSecurityCertWithToken.ts`
- `projects/ngx-soap/src/lib/soap/security/WSSecurityPlusCert.ts`

**WSSecurityCertWithToken** (WS-Security + Username Token):
```typescript
export class WSSecurityCertWithToken {
  private cert: WSSecurityCert;
  private token: WSSecurity;
  
  constructor(
    privatePEM: string | Buffer,
    publicP12PEM: string | Buffer,
    password: string,
    options: {
      username?: string;
      password?: string;
      passwordType?: string;
      hasTimeStamp?: boolean;
    }
  ) {
    this.cert = new WSSecurityCert(privatePEM, publicP12PEM, password);
    this.token = new WSSecurity(options.username, options.password, options);
  }
  
  toXML(): string {
    // Combine both cert and username token in security header
    return `<wsse:Security>
      ${this.token.toXML()}
      ${this.cert.toXML()}
    </wsse:Security>`;
  }
}
```

**WSSecurityPlusCert** (Combined WSSecurity + WSSecurityCert):
```typescript
export class WSSecurityPlusCert {
  constructor(
    private wsSecurity: WSSecurity,
    private wsSecurityCert: WSSecurityCert
  ) {}
  
  toXML(): string {
    return this.wsSecurity.toXML() + this.wsSecurityCert.toXML();
  }
  
  addOptions(options: any): void {
    this.wsSecurity.addOptions(options);
  }
}
```

**Steps**:
1. Study node-soap implementations (v1.0.3, v1.0.0)
2. Create new security classes
3. Adapt crypto operations for browser (use crypto-js)
4. Add to exports in security/index.ts
5. Write tests for each protocol
6. Document usage in README

**Verification**:
- [ ] WSSecurityCertWithToken works
- [ ] WSSecurityPlusCert works
- [ ] Exported from security module
- [ ] Tests pass
- [ ] README has examples

---

### Task 3.3: Enhance Client Events with Exchange ID

**File**: `projects/ngx-soap/src/lib/soap/client.ts`

**Add Exchange ID (EID) tracking**:
```typescript
Client.prototype._invoke = function(method, args, location, options, extraHeaders): Observable<any> {
  // Generate or use provided exchange ID
  const eid = options.exchangeId || generateUUID();
  
  // Emit events with EID
  this.emit('request', xml, eid);
  this.emit('message', message, eid);
  
  // ... HTTP call ...
  
  this.emit('response', body, response, eid);
  this.emit('soapError', error, eid);
}
```

**Update interfaces**:
```typescript
// interfaces.ts
export interface Client extends EventEmitter {
  emit(event: 'request', xml: string, eid: string): boolean;
  emit(event: 'message', message: string, eid: string): boolean;
  emit(event: 'soapError', error: any, eid: string): boolean;
  emit(event: 'response', body: any, response: any, eid: string): boolean;
  
  on(event: 'request', listener: (xml: string, eid: string) => void): this;
  on(event: 'message', listener: (message: string, eid: string) => void): this;
  on(event: 'soapError', listener: (error: any, eid: string) => void): this;
  on(event: 'response', listener: (body: any, response: any, eid: string) => void): this;
}
```

**Steps**:
1. Add EID generation to _invoke
2. Update all emit() calls with EID
3. Update interface definitions
4. Add exchangeId to IOptions
5. Write tests for EID tracking
6. Document in README

**Verification**:
- [ ] Events emitted with correct EID
- [ ] EID persists through request/response cycle
- [ ] Custom EID can be provided via options
- [ ] Backward compatible (existing code works)
- [ ] Tests pass

---

### Task 3.4: Improve TypeScript Definitions

**Files**: `interfaces.ts`, `_soap.d.ts`

**Add JSDoc to all options**:
```typescript
export interface IOptions extends IWsdlBaseOptions {
  /** 
   * Override the SOAP service endpoint address
   * @example { endpoint: 'https://api.example.com/soap' }
   */
  endpoint?: string;
  
  /**
   * Use self-closing tags for empty elements
   * @default false
   * @example { useEmptyTag: true } // <Tag /> instead of <Tag></Tag>
   */
  useEmptyTag?: boolean;
  
  /**
   * Return SOAP Faults as data instead of throwing errors
   * @default false
   */
  returnFault?: boolean;
  
  // ... all options with JSDoc
}
```

**Add generic types where applicable**:
```typescript
export interface Client<T = any> {
  describe(): T;
  setSecurity(security: ISecurity): void;
  [method: string]: (...args: any[]) => Observable<any>;
}
```

**Steps**:
1. Add JSDoc to every option in IOptions
2. Add examples to JSDoc
3. Add generic types where applicable
4. Update _soap.d.ts with missing interfaces
5. Verify TypeScript compilation
6. Check IDE autocomplete works

**Verification**:
- [ ] All options have JSDoc
- [ ] Examples included
- [ ] No TypeScript errors
- [ ] IDE autocomplete improved
- [ ] Inline docs visible in IDE

---

### Task 3.5: Test Phase 3 Completely

**Test Scenarios**:

```bash
# 1. Unit tests
npm run test:lib

# 2. Coverage (should be >80%)
npm run test:coverage

# 3. Build
npm run build:lib

# 4. Integration tests
npm run start
# Test in browser with real SOAP service
```

**Feature Testing**:
- [ ] useEmptyTag produces correct XML
- [ ] preserveWhitespace works
- [ ] normalizeNames handles special chars
- [ ] envelopeKey changes envelope prefix
- [ ] WSSecurityCertWithToken works
- [ ] WSSecurityPlusCert works
- [ ] Event EID tracking works
- [ ] All new options work
- [ ] TypeScript types correct
- [ ] IDE autocomplete works

**Compatibility Testing**:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Works in HTTPS
- [ ] Works in HTTP (with UUID fallback)

---

### Task 3.6: Update Documentation

**README.md updates**:
```markdown
## New Options (v0.18.0)

### useEmptyTag
Use self-closing tags for empty elements.
\`\`\`typescript
createClient(url, { useEmptyTag: true });
// <Tag /> instead of <Tag></Tag>
\`\`\`

### returnFault
Return SOAP Faults as data instead of throwing errors.
\`\`\`typescript
createClient(url, { returnFault: true });
// Faults returned in response, no error thrown
\`\`\`

### envelopeKey
Customize the SOAP envelope prefix.
\`\`\`typescript
createClient(url, { envelopeKey: 'SOAP-ENV' });
// <SOAP-ENV:Envelope> instead of <soap:Envelope>
\`\`\`

## New Security Protocols

### WSSecurityCertWithToken
\`\`\`typescript
import { WSSecurityCertWithToken } from 'ngx-soap';

const security = new WSSecurityCertWithToken(
  privatePEM,
  publicP12PEM,
  'password',
  { username: 'user', password: 'pass' }
);
client.setSecurity(security);
\`\`\`

## Event Tracking with Exchange IDs

\`\`\`typescript
client.on('request', (xml, eid) => {
  console.log(\`Request \${eid}:\`, xml);
});

client.on('response', (body, response, eid) => {
  console.log(\`Response \${eid}:\`, body);
});
\`\`\`
```

**Steps**:
- [ ] Document all new options
- [ ] Add examples for each feature
- [ ] Update security protocols section
- [ ] Add migration guide (v0.17 → v0.18)
- [ ] Update CHANGELOG.md

---

### Task 3.7: Commit Phase 3

```bash
git add .
git commit -m "feat: phase 3 - new options and features

- Added 8+ new configuration options (useEmptyTag, preserveWhitespace, etc.)
- Added WSSecurityCertWithToken security protocol
- Added WSSecurityPlusCert security protocol
- Enhanced client events with exchange ID (EID) tracking
- Improved TypeScript definitions with JSDoc
- Updated documentation and examples
- All tests passing (170+)"

git push origin update-node-soap
```

**Verification**:
- [ ] All tests pass
- [ ] Build succeeds
- [ ] Documentation complete
- [ ] CHANGELOG updated
- [ ] No breaking changes

---

## Progress Summary

| Phase | Tasks | Status | Tests | Commit |
|-------|-------|--------|-------|--------|
| Phase 1 | 7/7 | ✅ Complete | 149 pass | e5969d7 |
| Phase 2 | 7/7 | ✅ Complete | 157 pass | b8c1fc3 |
| Phase 3 | 0/7 | ⏳ Pending | - | - |

**Total Progress**: 14/21 tasks (67%)

---

## Quick Commands

```bash
# Development
npm run test:lib           # Run tests
npm run build:lib          # Build library
npm run start              # Test in app

# Git
git status                 # Check changes
git log --oneline -5       # View commits
git diff                   # See changes

# Search
grep -r "pattern" projects/ngx-soap/src/ --include="*.ts"
```

---

## Reference

- **BACKPORT_INFO.md**: Technical details, code patterns, architecture decisions
- **Branch**: `update-node-soap`
- **Base**: node-soap v0.17.0 (2016)
- **Target**: node-soap v1.6.0 (2025)

**Last Updated**: 2025-11-22 (Phase 1 & 2 complete)
