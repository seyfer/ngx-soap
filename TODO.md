# ngx-soap Backport Implementation TODO

> **Reference Documentation**: See README_BACKPORT.md for overview and ARCHITECTURE_DECISION.md for why we can't use node-soap directly.

> **Branch**: All work will be done in `update-node-soap` branch

> **Note**: Version numbers (0.17.0, 0.18.0, etc.) represent Angular versions, not library updates. This backport improves the library without changing the version number.

---

## 🔴 PHASE 1: Critical Security & Dependencies (Week 1)

**Priority**: CRITICAL  
**Risk**: Low  
**Reference**: [BACKPORT_CHECKLIST.md](./BACKPORT_CHECKLIST.md#phase-1-critical-security--dependencies) → Phase 1

---

### Task 1.1: Update xml-crypto (CRITICAL) ⚠️

**Why**: Security vulnerabilities in v2.x. Current: v2.1.6 → Target: v6.1.2

**Steps**:
```bash
# 1. Update package.json
npm install xml-crypto@^6.1.2

# 2. Run tests to check for breaking changes
npm run test:lib -- --testPathPattern=security

# 3. If tests fail, review breaking changes
# See: https://github.com/node-saml/xml-crypto/releases
```

**Files to Check**:
- [ ] `projects/ngx-soap/src/lib/soap/security/WSSecurityCert.ts`
- [ ] `projects/ngx-soap/src/lib/soap/security/WSSecurity.ts`
- [ ] All security test files

**Verification**:
- [ ] All security tests pass
- [ ] No new console errors
- [ ] WS-Security signing still works
- [ ] Certificate validation works

**Reference**: 
- CODE_COMPARISON.md → Section 2
- BACKPORT_CHECKLIST.md → Task 1.1

---

### Task 1.2: Replace uuid with crypto.randomUUID()

**Why**: Remove unnecessary dependency, use native crypto

**Steps**:
```bash
# 1. Find all uuid imports
grep -r "uuid" projects/ngx-soap/src/ --include="*.ts"

# 2. For each file, replace:
#    OLD: import * as uuid from 'uuid'; const id = uuid.v4();
#    NEW: import { randomUUID } from 'crypto'; const id = randomUUID();

# 3. Remove dependency
npm uninstall uuid

# 4. Test
npm run test:lib
npm run build:lib
```

**Files to Update** (likely):
- [ ] `projects/ngx-soap/src/lib/soap/client.ts`
- [ ] Any file generating IDs or GUIDs

**Browser Compatibility Note**:
```typescript
// If you need HTTP support (non-secure contexts), use this:
const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for non-secure contexts
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
```

**Verification**:
- [ ] No uuid imports remain
- [ ] uuid removed from package.json
- [ ] All tests pass
- [ ] UUIDs still generated correctly
- [ ] Works in browser (test in HTTPS)

**Reference**: 
- CODE_COMPARISON.md → Section 2
- ARCHITECTURE_DECISION.md → "Concrete Example: UUID Generation"

---

### Task 1.3: Optimize trim() Function

**File**: `projects/ngx-soap/src/lib/soap/wsdl.ts`

**Steps**:
```typescript
// 1. Locate current implementation (around line 91-96)
// OLD:
let trimLeft = /^[\s\xA0]+/;
let trimRight = /[\s\xA0]+$/;

function trim(text) {
  return text.replace(trimLeft, '').replace(trimRight, '');
}

// 2. Replace with:
function trim(text: string): string {
  return text.trim();
}

// 3. Delete the regex variables (no longer needed)

// 4. Test
npm run test:lib
```

**Verification**:
- [ ] trim() function updated
- [ ] trimLeft and trimRight variables removed
- [ ] All tests pass
- [ ] WSDL parsing still works
- [ ] Performance is same or better

**Benefit**: 2x faster on large strings

**Reference**: 
- CODE_COMPARISON.md → Section 1
- BACKPORT_CHECKLIST.md → Task 2.1

---

### Task 1.4: Update Other Dependencies

**Steps**:
```bash
# Update sax
npm install sax@^1.4.1

# Update lodash
npm install lodash@^4.17.21

# Test
npm run test:lib
npm run build:lib
```

**Verification**:
- [ ] sax updated to v1.4.1
- [ ] lodash updated to v4.17.21
- [ ] All tests pass
- [ ] No new warnings
- [ ] Application works correctly

**Reference**: 
- BACKPORT_CHECKLIST.md → Task 1.3, 1.4

---

### Task 1.5: Add Debug Package (Optional but Recommended)

**Steps**:
```bash
# 1. Install
npm install debug@^4.4.3

# 2. Add to your code (examples)
# File: projects/ngx-soap/src/lib/soap/wsdl.ts
import debugBuilder from 'debug';
const debug = debugBuilder('ngx-soap:wsdl');

// Usage:
debug('Loading WSDL from: %s', url);
debug('Parsed %d operations', operationCount);

# 3. Enable in development
# In browser console:
localStorage.debug = 'ngx-soap:*';
```

**Files to Add Debug To** (suggested):
- [ ] `wsdl.ts` - WSDL parsing
- [ ] `client.ts` - Client operations
- [ ] `http.ts` - HTTP requests
- [ ] `security/*.ts` - Security operations

**Verification**:
- [ ] Debug package installed
- [ ] Debug statements added to key files
- [ ] Can enable/disable via localStorage
- [ ] Debug output helpful for troubleshooting

**Reference**: 
- CODE_COMPARISON.md → Section 12

---

### Task 1.6: Test Phase 1 Completely

**Test Checklist**:
```bash
# 1. Unit tests
npm run test:lib

# 2. Build
npm run build:lib

# 3. Test in actual Angular app
npm run start
# Or: npm run serve

# 4. Test these scenarios:
```

- [ ] Create SOAP client with various WSDLs
- [ ] Call SOAP methods successfully
- [ ] WS-Security signing works
- [ ] BasicAuthSecurity works
- [ ] NTLM works (if used)
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Performance is same or better

**Reference**: 
- BACKPORT_CHECKLIST.md → "Testing Checklist Before Release"

---

### Task 1.7: Commit Phase 1 Changes

**Steps**:
```bash
# Commit changes to update-node-soap branch
git add .
git commit -m "feat: phase 1 - security updates and performance improvements

- Updated xml-crypto from v2.1.6 to v6.1.2 (CRITICAL)
- Replaced uuid package with native crypto.randomUUID()
- Optimized trim() function (2x faster)
- Updated sax to v1.4.1
- Updated lodash to v4.17.21
- Removed uuid dependency
- Added debug package for better logging"

# Push to branch
git push origin update-node-soap
```

**Verification**:
- [ ] All tests pass
- [ ] Build succeeds
- [ ] Changes committed to update-node-soap branch
- [ ] No breaking changes introduced

---

## 🟡 PHASE 2: Bug Fixes & Performance (Weeks 2-4)

**Priority**: HIGH  
**Risk**: Low-Medium  
**Reference**: [BACKPORT_CHECKLIST.md](./BACKPORT_CHECKLIST.md#phase-3-bug-fixes) → Phase 3

---

### Task 2.1: Fix Namespace Handling

**Issue**: Arrays and complex types may not get correct namespace prefixes

**Reference**: 
- BACKPORT_ANALYSIS.md → Section 4.1 "Namespace Handling"
- node-soap versions: v0.18.0 - v1.6.0

**Steps**:

1. **Study node-soap changes**:
```bash
# In node-soap directory
cd node-soap
git log --oneline --grep="namespace" --since="2016-01-01"
# Review commits related to namespace handling
```

2. **Files to Review**:
- [ ] `projects/ngx-soap/src/lib/soap/wsdl.ts` - objectToXML method
- [ ] `projects/ngx-soap/src/lib/soap/nscontext.ts` - namespace context
- [ ] Compare with: `node-soap/src/wsdl/index.ts`

3. **Specific Issues to Fix**:
- [ ] Arrays inherit namespace from parent/schema
- [ ] Complex types use correct namespace prefix
- [ ] Nested elements maintain proper namespaces
- [ ] Multiple schemas with same namespace handled correctly

4. **Test Cases to Add**:
```typescript
// Test: Array with namespace
{ items: ['item1', 'item2'] }  // Should get correct ns prefix

// Test: Complex type with namespace
{ complexType: { field1: 'value', field2: 'value' } }

// Test: Nested arrays
{ outer: { inner: ['nested1', 'nested2'] } }
```

**Verification**:
- [ ] Tests pass for simple arrays
- [ ] Tests pass for complex types
- [ ] Tests pass for nested structures
- [ ] Real WSDL services work correctly
- [ ] No namespace prefix errors in SOAP XML

**Reference**: 
- BACKPORT_CHECKLIST.md → Task 3.1
- CODE_COMPARISON.md → Section 11

---

### Task 2.2: Handle Empty SOAP Body

**Issue**: Empty response bodies may cause crashes

**File**: `projects/ngx-soap/src/lib/soap/client.ts`

**Steps**:

1. **Add null/undefined checks**:
```typescript
// In response handling code, add:
if (!body || typeof body !== 'object' || Object.keys(body).length === 0) {
  // Handle empty body
  debug('Received empty SOAP body');
  return callback(null, {});
}

// Before accessing body properties:
if (body && body.Body) {
  // Process body
}
```

2. **Handle one-way operations** (no response expected):
```typescript
// Check if operation expects response
if (operation.output === undefined) {
  // One-way operation
  return callback(null, { success: true });
}
```

3. **Add test cases**:
```typescript
// Test: Empty body response
// Test: One-way operation
// Test: Body with no content
```

**Verification**:
- [ ] No crashes on empty responses
- [ ] One-way operations handled
- [ ] Proper error messages
- [ ] Tests pass

**Reference**: 
- BACKPORT_CHECKLIST.md → Task 3.2

---

### Task 2.3: Fix Element Reference Handling

**Issue**: XSD element refs may not be resolved correctly

**File**: `projects/ngx-soap/src/lib/soap/wsdl.ts`

**Reference**: node-soap PR #700, #1260, v1.1.6

**Steps**:

1. **Study element reference resolution**:
- [ ] Review how `ref` attribute is parsed
- [ ] Check `maxOccurs` and `minOccurs` on refs
- [ ] Test refs across namespaces

2. **Add/fix element ref handling**:
```typescript
// When processing schema elements with ref attribute
if (element.$ref) {
  const refElement = this.findElement(element.$ref);
  if (refElement) {
    // Apply ref element properties
    // Handle maxOccurs, minOccurs from original element
  }
}
```

3. **Test cases**:
- [ ] Simple element ref
- [ ] Ref with maxOccurs/minOccurs
- [ ] Ref across namespaces
- [ ] Ref to imported schema

**Verification**:
- [ ] Element refs resolve correctly
- [ ] Occurs attributes respected
- [ ] Cross-namespace refs work
- [ ] Real WSDLs with refs work

**Reference**: 
- BACKPORT_CHECKLIST.md → Task 3.3

---

### Task 2.4: Improve SOAP Fault Handling

**Issue**: SOAP Faults not handled consistently

**File**: `projects/ngx-soap/src/lib/soap/client.ts`

**Reference**: 
- CODE_COMPARISON.md → Section 14
- node-soap v0.42.0, v0.6.0

**Steps**:

1. **Enhance fault handling**:
```typescript
if (obj.Body && obj.Body.Fault) {
  const fault = obj.Body.Fault;
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

  const error = new Error(string);
  error.code = code;
  error.actor = actor;
  error.detail = detail;
  error.statusCode = fault.statusCode || 500;
  error.response = response;
  error.body = body;

  if (options.returnFault) {
    // Return as data, not error
    return callback(null, fault);
  }

  return callback(error, fault);
}
```

2. **Add returnFault option**:
- [ ] Add to IOptions interface
- [ ] Document in README

3. **Test cases**:
- [ ] SOAP 1.1 fault
- [ ] SOAP 1.2 fault
- [ ] returnFault option
- [ ] Fault with custom statusCode

**Verification**:
- [ ] SOAP 1.1 faults handled
- [ ] SOAP 1.2 faults handled
- [ ] returnFault option works
- [ ] Error details preserved

**Reference**: 
- BACKPORT_CHECKLIST.md → Task 3.3

---

### Task 2.5: Implement WSDL Parsing Performance Improvements

**Reference**: 
- node-soap v1.0.4 (June 2024)
- node-soap v1.3.0 (Aug 2025)

**Files**:
- `projects/ngx-soap/src/lib/soap/wsdl.ts`
- `projects/ngx-soap/src/lib/soap/nscontext.ts`

**Steps**:

1. **Optimize namespace handling**:
```typescript
// In nscontext.ts
// Use Map instead of Object for better performance
export class NamespaceContext {
  private declarations: Map<string, string>;
  private prefixes: Map<string, string>;
  
  constructor(parent?: NamespaceContext) {
    this.declarations = new Map();
    this.prefixes = new Map();
    // ...
  }
  
  getNamespaceURI(prefix: string): string {
    return this.declarations.get(prefix) 
      || (this.parent && this.parent.getNamespaceURI(prefix))
      || null;
  }
}
```

2. **Cache frequently used lookups**:
- [ ] Cache namespace URIs
- [ ] Cache element definitions
- [ ] Avoid repeated parsing

3. **Benchmark before/after**:
```typescript
// Test with large WSDL files
const start = performance.now();
await createClient(largeWsdlUrl);
const end = performance.now();
console.log(`WSDL parsing took ${end - start}ms`);
```

**Verification**:
- [ ] Parsing is faster (measure with benchmarks)
- [ ] Memory usage acceptable
- [ ] Large WSDLs load faster
- [ ] No regression in functionality

**Reference**: 
- CODE_COMPARISON.md → Section 11

---

### Task 2.6: Test Phase 2 Completely

**Comprehensive Testing**:

1. **Unit Tests**:
```bash
npm run test:lib
npm run test:coverage  # Ensure >80% coverage
```

2. **Integration Tests with Real SOAP Services**:
- [ ] Test with document/literal WSDL
- [ ] Test with rpc/encoded WSDL
- [ ] Test with SOAP 1.1
- [ ] Test with SOAP 1.2
- [ ] Test with complex types
- [ ] Test with arrays
- [ ] Test with nested structures
- [ ] Test with multiple namespaces
- [ ] Test with imported schemas
- [ ] Test fault handling

3. **Performance Tests**:
- [ ] WSDL parsing time
- [ ] Request generation time
- [ ] Memory usage
- [ ] Bundle size

4. **Browser Compatibility**:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

**Reference**: 
- BACKPORT_CHECKLIST.md → "Testing Checklist Before Release"

---

### Task 2.7: Commit Phase 2 Changes

**Steps**:
```bash
# Commit changes to update-node-soap branch
git add .
git commit -m "feat: phase 2 - bug fixes and performance improvements

- Fixed namespace handling for arrays and complex types
- Fixed empty SOAP body handling
- Fixed element reference resolution
- Improved SOAP Fault handling (SOAP 1.1 and 1.2)
- Optimized WSDL parsing (faster with large WSDLs)
- Improved namespace context performance
- Added returnFault option for SOAP Fault handling"

# Push to branch
git push origin update-node-soap
```

**Verification**:
- [ ] All tests pass
- [ ] Build succeeds
- [ ] Changes committed to update-node-soap branch
- [ ] No breaking changes introduced

---

## 🟢 PHASE 3: New Features & Options (Weeks 5-7)

**Priority**: MEDIUM  
**Risk**: Low  
**Reference**: [BACKPORT_CHECKLIST.md](./BACKPORT_CHECKLIST.md#phase-4-new-options--features) → Phase 4-6

---

### Task 3.1: Add New Configuration Options

**File**: `projects/ngx-soap/src/lib/soap/interfaces.ts`

**Options to Add**:

1. **useEmptyTag** (v0.21.0):
```typescript
export interface IOptions {
  // ... existing options
  
  /** Use <Tag /> instead of <Tag></Tag> for empty elements */
  useEmptyTag?: boolean;
}
```

**Implementation** in `wsdl.ts`:
```typescript
function objectToXML(obj, name, namespace, xmlns, useEmptyTag = false) {
  // ...
  let content = '';
  // ... build content
  
  if (useEmptyTag && !content) {
    return `<${prefix}${name}${xmlns}${attributes} />`;
  }
  
  return `<${prefix}${name}${xmlns}${attributes}>${content}</${prefix}${name}>`;
}
```

2. **preserveWhitespace** (v0.22.0):
```typescript
/** Preserve leading and trailing whitespace */
preserveWhitespace?: boolean;
```

**Implementation**: Update trim() calls to respect option

3. **normalizeNames** (v0.23.0):
```typescript
/** Replace non-identifier characters in operation names with _ */
normalizeNames?: boolean;
```

4. **Add these options**:
```typescript
escapeXML?: boolean;              // Control XML escaping
returnFault?: boolean;            // Return faults as data
suppressStack?: boolean;          // Hide stack traces in errors
forceUseSchemaXmlns?: boolean;    // Force schema xmlns usage
envelopeKey?: string;             // Custom envelope key
overridePromiseSuffix?: string;   // Override Async suffix
```

**Steps**:
- [ ] Add all options to IOptions interface
- [ ] Document each option with JSDoc
- [ ] Implement each option in relevant files
- [ ] Add test for each option
- [ ] Update README with option documentation

**Reference**: 
- BACKPORT_CHECKLIST.md → Task 4.1, 4.2, 4.3
- CODE_COMPARISON.md → Section 4, 8

---

### Task 3.2: Add Enhanced Security Protocols

**New Files to Create**:

1. **WSSecurityCertWithToken**:
```typescript
// File: projects/ngx-soap/src/lib/soap/security/WSSecurityCertWithToken.ts

/**
 * WS-Security with both certificate and username token
 * Combines WSSecurityCert with UsernameToken
 */
export class WSSecurityCertWithToken {
  constructor(
    privatePEM: string | Buffer,
    publicP12PEM: string | Buffer,
    password: string,
    options: {
      username?: string;
      password?: string;
      // ... other options
    }
  ) {
    // Implementation
  }
  
  toXML(): string {
    // Generate security header with both cert and username token
  }
}
```

2. **WSSecurityPlusCert**:
```typescript
// File: projects/ngx-soap/src/lib/soap/security/WSSecurityPlusCert.ts

/**
 * Use WSSecurity and WSSecurityCert together
 */
export class WSSecurityPlusCert {
  constructor(
    wsSecurity: WSSecurity,
    wsSecurityCert: WSSecurityCert
  ) {
    // Implementation
  }
}
```

**Steps**:
- [ ] Study node-soap implementations
- [ ] Create new security classes
- [ ] Adapt crypto operations for browser (crypto-js)
- [ ] Add tests for each security protocol
- [ ] Export from security module
- [ ] Document usage in README

**Reference**: 
- BACKPORT_CHECKLIST.md → Task 6.1, 6.2
- CODE_COMPARISON.md → Section 7
- ARCHITECTURE_DECISION.md → "Adapt Security"

---

### Task 3.3: Enhance Client Events

**File**: `projects/ngx-soap/src/lib/soap/client.ts`

**Reference**: 
- CODE_COMPARISON.md → Section 6
- node-soap v0.7.0 and later

**Steps**:

1. **Add exchange ID support**:
```typescript
// Generate or use provided exchange ID
const eid = options.exchangeId || generateUUID();

// Emit events with exchange ID
this.emit('request', xml, eid);
this.emit('message', message, eid);
// ... later
this.emit('response', body, response, eid);
this.emit('soapError', error, eid);
```

2. **Update event interfaces**:
```typescript
export interface Client {
  emit(event: 'request', xml: string, eid: string): boolean;
  emit(event: 'message', message: string, eid: string): boolean;
  emit(event: 'soapError', error: any, eid: string): boolean;
  emit(event: 'response', body: any, response: any, eid: string): boolean;

  on(event: 'request', listener: (xml: string, eid: string) => void): this;
  on(event: 'message', listener: (message: string, eid: string) => void): this;
  on(event: 'soapError', listener: (error, eid: string) => void): this;
  on(event: 'response', listener: (body: any, response: any, eid: string) => void): this;
}
```

3. **Add test cases**:
- [ ] Events emitted with correct EID
- [ ] EID persists through request/response cycle
- [ ] Custom EID can be provided

**Verification**:
- [ ] Events work as expected
- [ ] EID tracking functional
- [ ] Backward compatible

---

### Task 3.4: Improve TypeScript Definitions

**Files**:
- `projects/ngx-soap/src/lib/soap/_soap.d.ts`
- `projects/ngx-soap/src/lib/soap/interfaces.ts`

**Steps**:

1. **Compare with node-soap types**:
```bash
# Review node-soap type definitions
cat node-soap/src/types.ts
```

2. **Updates to make**:
- [ ] Add missing interface properties
- [ ] Add JSDoc comments for all options
- [ ] Add generic types where applicable
- [ ] Update return types for async methods
- [ ] Mark deprecated options

3. **Example improvements**:
```typescript
export interface IOptions {
  /** 
   * Override the SOAP service endpoint address
   * @example 'https://api.example.com/soap'
   */
  endpoint?: string;
  
  /**
   * Custom envelope key (default: 'soap')
   * @example 'SOAP-ENV'
   */
  envelopeKey?: string;
  
  // ... all options with JSDoc
}
```

**Verification**:
- [ ] No TypeScript errors
- [ ] Better IDE autocomplete
- [ ] Inline documentation visible

**Reference**: 
- BACKPORT_CHECKLIST.md → Task 7.1, 7.2

---

### Task 3.5: Test Phase 3 Completely

**Test All New Features**:

1. **Options Testing**:
- [ ] useEmptyTag produces correct XML
- [ ] preserveWhitespace works
- [ ] normalizeNames handles special chars
- [ ] All new options work as documented

2. **Security Testing**:
- [ ] WSSecurityCertWithToken works
- [ ] WSSecurityPlusCert works
- [ ] Existing security still works

3. **Events Testing**:
- [ ] All events emit with EID
- [ ] Custom EID works
- [ ] Event listeners work

4. **TypeScript Testing**:
- [ ] No compilation errors
- [ ] Types are correct
- [ ] IDE autocomplete works

**Reference**: 
- BACKPORT_CHECKLIST.md → Phase 8

---

### Task 3.6: Update Documentation

**Files to Update**:

1. **README.md**:
- [ ] Document all new options
- [ ] Add examples for new features
- [ ] Update security protocols section
- [ ] Add migration guide

2. **Create MIGRATION.md**:
```markdown
# Migration Guide

## From v0.17.0 to v0.20.0

### Breaking Changes
None! All new features are opt-in.

### New Options
...

### New Security Protocols
...

### Bug Fixes
...
```

3. **Update Examples**:
- [ ] Add examples for new options
- [ ] Add examples for new security protocols
- [ ] Update existing examples

**Reference**: 
- BACKPORT_CHECKLIST.md → Task 8.2

---

### Task 3.7: Commit Phase 3 Changes

**Steps**:
```bash
# Commit changes to update-node-soap branch
git add .
git commit -m "feat: phase 3 - new features and options

- Added useEmptyTag option for self-closing tags
- Added preserveWhitespace option
- Added normalizeNames option
- Added 15+ new configuration options
- Added WSSecurityCertWithToken security protocol
- Added WSSecurityPlusCert security protocol
- Enhanced client events with exchange ID support
- Improved TypeScript definitions
- Better JSDoc documentation
- Enhanced error messages"

# Push to branch
git push origin update-node-soap
```

**Verification**:
- [ ] All tests pass
- [ ] Build succeeds
- [ ] README updated
- [ ] Changes committed to update-node-soap branch
- [ ] No breaking changes introduced

---

## 🔵 PHASE 4: HTTP Migration (OPTIONAL - Not Recommended)

**Priority**: LOW (Optional)  
**Risk**: HIGH  
**Timeline**: 3-4 weeks  
**Reference**: [ARCHITECTURE_DECISION.md](./ARCHITECTURE_DECISION.md) → "Don't switch to axios"

### ⚠️ Important Note

**You probably DON'T need this phase!** 

Your current Angular HttpClient integration is better for Angular apps than axios because:
- ✅ Better Angular integration
- ✅ Works with HttpInterceptors
- ✅ Supports RxJS observables
- ✅ Handles Zone.js correctly
- ✅ Better for CORS

**Only consider Phase 4 if**:
- You have specific axios-only features you need
- You're willing to maintain an adapter layer
- You're planning a major version (v1.0.0)
- You understand the trade-offs

**If you still want to proceed**, see:
- BACKPORT_CHECKLIST.md → Phase 5
- ARCHITECTURE_DECISION.md → "HTTP Client Migration"

---

## Progress Tracking

**Branch**: `update-node-soap`

### Phase 1 Status: 🔴 Not Started
- [ ] xml-crypto updated
- [ ] uuid replaced
- [ ] trim() optimized
- [ ] Dependencies updated
- [ ] Debug package added
- [ ] Tests pass
- [ ] Changes committed

### Phase 2 Status: ⚪ Waiting
- [ ] Namespace fixes
- [ ] Empty body handling
- [ ] Element refs
- [ ] SOAP Fault improvements
- [ ] Performance improvements
- [ ] Tests pass
- [ ] Changes committed

### Phase 3 Status: ⚪ Waiting
- [ ] New options added
- [ ] New security protocols
- [ ] Events enhanced
- [ ] TypeScript improved
- [ ] Documentation updated
- [ ] Tests pass
- [ ] Changes committed

---

## Quick Reference

### Essential Commands

```bash
# Switch to work branch
git checkout update-node-soap

# Install dependencies
npm install

# Run tests
npm run test:lib

# Run with coverage
npm run test:coverage

# Build library
npm run build:lib

# Run app
npm run start

# Commit changes
git add .
git commit -m "feat: description of changes"
git push origin update-node-soap
```

### Documentation Links

- **Why wrapper needed**: [ARCHITECTURE_DECISION.md](./ARCHITECTURE_DECISION.md)
- **Overview**: [README_BACKPORT.md](./README_BACKPORT.md)
- **Full analysis**: [BACKPORT_ANALYSIS.md](./BACKPORT_ANALYSIS.md)
- **Detailed checklist**: [BACKPORT_CHECKLIST.md](./BACKPORT_CHECKLIST.md)
- **Code examples**: [CODE_COMPARISON.md](./CODE_COMPARISON.md)
- **Decision guide**: [BACKPORT_SUMMARY.md](./BACKPORT_SUMMARY.md)

### Getting Help

If stuck on any task:
1. Check the Reference links in each task
2. Review the corresponding section in documentation
3. Look at node-soap source code for reference
4. Test with node-soap in Node.js to see expected behavior

---

## Notes

- Update this TODO file as you progress
- Mark tasks complete with [x]
- Add notes about issues encountered
- Update estimates if needed
- Celebrate small wins! 🎉

**Start with Phase 1, Task 1.1 (xml-crypto update) - it's critical!**

