# Backport Implementation Checklist

This document provides specific, actionable items for backporting improvements from node-soap v1.6.0 to ngx-soap.

---

## Phase 1: Critical Security & Dependencies ⚠️

### Task 1.1: Update xml-crypto (HIGH PRIORITY)

**Current Version**: ^2.1.6  
**Target Version**: ^6.1.2  
**Risk**: Medium (breaking changes possible)

**Steps**:
- [ ] Update `package.json`:
  ```json
  "xml-crypto": "^6.1.2"
  ```
- [ ] Run `npm install`
- [ ] Review breaking changes from xml-crypto changelog
- [ ] Update security implementations in:
  - [ ] `projects/ngx-soap/src/lib/soap/security/WSSecurityCert.ts`
  - [ ] `projects/ngx-soap/src/lib/soap/security/WSSecurityCertWithToken.ts` (if exists)
- [ ] Test WS-Security signing
- [ ] Test certificate validation
- [ ] Run full security test suite

**Testing**:
```bash
npm run test:lib -- --testPathPattern=security
```

---

### Task 1.2: Replace uuid with crypto.randomUUID()

**Current**: uuid v3.3.2  
**Target**: Native crypto API  
**Risk**: Low

**Steps**:
- [ ] Search for all uuid imports:
  ```bash
  grep -r "import.*uuid" projects/ngx-soap/src/
  grep -r "require.*uuid" projects/ngx-soap/src/
  ```

- [ ] Replace in each file:
  ```typescript
  // OLD
  import * as uuid from 'uuid';
  const id = uuid.v4();
  
  // NEW
  import { randomUUID } from 'crypto';
  const id = randomUUID();
  ```

- [ ] Remove from `package.json`:
  ```json
  // Remove this line
  "uuid": "^3.3.2"
  ```

- [ ] Run tests
- [ ] Verify in browser (crypto.randomUUID requires secure context)

**Files to check**:
- [ ] `projects/ngx-soap/src/lib/soap/client.ts`
- [ ] Any file generating IDs or GUIDs

**Browser Compatibility Note**:
- crypto.randomUUID() requires HTTPS in browsers
- Fallback for non-secure contexts:
  ```typescript
  const generateUUID = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback for older browsers/non-secure contexts
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };
  ```

---

### Task 1.3: Update sax

**Current**: ^1.2.4  
**Target**: ^1.4.1  
**Risk**: Low

**Steps**:
- [ ] Update in `package.json`:
  ```json
  "sax": "^1.4.1"
  ```
- [ ] Run `npm install`
- [ ] Run WSDL parsing tests
- [ ] Test with various WSDL files

---

### Task 1.4: Update lodash

**Current**: ^4.17.10  
**Target**: ^4.17.21  
**Risk**: Low

**Steps**:
- [ ] Update in `package.json`:
  ```json
  "lodash": "^4.17.21"
  ```
- [ ] Run `npm install`
- [ ] Check for deprecated method usage
- [ ] Run full test suite

---

## Phase 2: Performance Quick Wins 🚀

### Task 2.1: Optimize trim() function

**File**: `projects/ngx-soap/src/lib/soap/wsdl.ts`  
**Risk**: Very Low

**Steps**:
- [ ] Locate the current trim implementation (around line 91-96)
- [ ] Replace with:
  ```typescript
  function trim(text: string): string {
    return text.trim();
  }
  ```
- [ ] Remove unused regex variables:
  ```typescript
  // DELETE these lines
  let trimLeft = /^[\s\xA0]+/;
  let trimRight = /[\s\xA0]+$/;
  ```

**Benefit**: ~2x faster on large strings

---

### Task 2.2: Add preserveWhitespace option

**File**: `projects/ngx-soap/src/lib/soap/wsdl.ts`  
**Risk**: Low

**Steps**:
- [ ] Add option to interfaces:
  ```typescript
  interface IOptions {
    // ... existing options
    preserveWhitespace?: boolean;
  }
  ```

- [ ] Update trim usage:
  ```typescript
  function trim(text: string, preserveWhitespace: boolean = false): string {
    return preserveWhitespace ? text : text.trim();
  }
  ```

- [ ] Update all trim() calls to respect option
- [ ] Add tests for whitespace preservation
- [ ] Document in README

---

## Phase 3: Bug Fixes 🐛

### Task 3.1: Fix namespace handling for arrays

**Files**: 
- `projects/ngx-soap/src/lib/soap/wsdl.ts`
- `projects/ngx-soap/src/lib/soap/nscontext.ts`

**Issue**: Arrays may not get correct namespace prefix

**Steps**:
- [ ] Review namespace handling in `objectToXML` method
- [ ] Ensure arrays inherit namespace from parent or schema
- [ ] Test with:
  - Simple arrays
  - Arrays of complex types
  - Nested arrays
- [ ] Add test cases

**Reference**: node-soap commits from v0.26.0 - v1.3.0

---

### Task 3.2: Handle empty SOAP Body

**File**: `projects/ngx-soap/src/lib/soap/client.ts`

**Issue**: Empty response bodies may cause crashes

**Steps**:
- [ ] Add null/undefined checks before processing response body
- [ ] Add test for empty body responses
- [ ] Handle one-way operations (no response expected)

**Code pattern**:
```typescript
if (!body || typeof body !== 'object' || Object.keys(body).length === 0) {
  // Handle empty body
  return callback(null, {});
}
```

---

### Task 3.3: Fix element reference handling

**File**: `projects/ngx-soap/src/lib/soap/wsdl.ts`

**Issue**: XSD element refs may not be resolved correctly

**Steps**:
- [ ] Review element reference resolution in schema parsing
- [ ] Check handling of `ref` attribute
- [ ] Check handling of `maxOccurs` and `minOccurs` on refs
- [ ] Add tests for:
  - Simple element refs
  - Ref with occurs attributes
  - Refs across namespaces

**Reference**: node-soap PR #700, #1260

---

## Phase 4: New Options & Features ✨

### Task 4.1: Add useEmptyTag option

**Files**: `projects/ngx-soap/src/lib/soap/wsdl.ts`

**Purpose**: Use `<tag />` instead of `<tag></tag>` for empty elements

**Steps**:
- [ ] Add option to interface:
  ```typescript
  interface IOptions {
    useEmptyTag?: boolean;
  }
  ```

- [ ] Update XML generation logic:
  ```typescript
  if (useEmptyTag && !hasContent) {
    return `<${tagName} ${attributes}/>`;
  } else {
    return `<${tagName} ${attributes}>${content}</${tagName}>`;
  }
  ```

- [ ] Add tests
- [ ] Document in README

---

### Task 4.2: Add escapeXML option

**Purpose**: Control whether to escape special XML characters

**Steps**:
- [ ] Add option (may already exist, verify)
- [ ] Ensure it's respected in all XML generation
- [ ] Default to `true` for security

---

### Task 4.3: Add normalizeNames option

**Purpose**: Replace non-identifier characters in operation names

**Steps**:
- [ ] Add option to interface
- [ ] Apply normalization when creating client methods:
  ```typescript
  const normalizedName = options.normalizeNames 
    ? methodName.replace(/[^a-z$_0-9]/gi, '_')
    : methodName;
  ```

- [ ] Add tests
- [ ] Document limitations (name collisions)

---

## Phase 5: HTTP Client Migration 🔄

### Task 5.1: Add axios dependency

**Risk**: High (major refactoring)

**Steps**:
- [ ] Add to `package.json`:
  ```json
  "axios": "^1.13.1",
  "axios-ntlm": "^1.4.6"
  ```

- [ ] Keep existing httpntlm as fallback option
- [ ] Create axios adapter for Angular HttpClient

---

### Task 5.2: Create HTTP client abstraction

**New File**: `projects/ngx-soap/src/lib/soap/http-adapters.ts`

**Purpose**: Abstract HTTP implementation to support both Angular HttpClient and axios

**Steps**:
- [ ] Define IHttpClient interface (already exists, verify completeness)
- [ ] Create AxiosAdapter class
- [ ] Create AngularHttpClientAdapter class  
- [ ] Add option to choose adapter:
  ```typescript
  interface IOptions {
    httpAdapter?: 'angular' | 'axios';
  }
  ```

---

### Task 5.3: Update http.ts

**File**: `projects/ngx-soap/src/lib/soap/http.ts`

**Steps**:
- [ ] Refactor to use adapter pattern
- [ ] Keep existing implementation as default
- [ ] Add axios implementation as alternative
- [ ] Ensure all options are passed through
- [ ] Test both adapters thoroughly

---

## Phase 6: Security Enhancements 🔐

### Task 6.1: Add WSSecurityCertWithToken

**New File**: `projects/ngx-soap/src/lib/soap/security/WSSecurityCertWithToken.ts`

**Purpose**: Combine certificate security with username token

**Steps**:
- [ ] Copy implementation from node-soap
- [ ] Adapt for ngx-soap
- [ ] Add tests
- [ ] Export from security module
- [ ] Document usage

---

### Task 6.2: Add WSSecurityPlusCert

**New File**: `projects/ngx-soap/src/lib/soap/security/WSSecurityPlusCert.ts`

**Purpose**: Use WSSecurity and WSSecurityCert together

**Steps**:
- [ ] Implement based on node-soap
- [ ] Add tests
- [ ] Export and document

---

### Task 6.3: Enhance BearerSecurity

**File**: `projects/ngx-soap/src/lib/soap/security/BearerSecurity.ts`

**Steps**:
- [ ] Verify implementation matches node-soap
- [ ] Add any missing features
- [ ] Update tests

---

## Phase 7: TypeScript Improvements 📘

### Task 7.1: Update type definitions

**File**: `projects/ngx-soap/src/lib/soap/_soap.d.ts`

**Steps**:
- [ ] Compare with node-soap type definitions
- [ ] Add missing interface properties
- [ ] Add generic types where applicable
- [ ] Update return types for async methods
- [ ] Add JSDoc comments

---

### Task 7.2: Improve IOptions interface

**File**: `projects/ngx-soap/src/lib/soap/interfaces.ts`

**Steps**:
- [ ] Add all new options from node-soap
- [ ] Add detailed JSDoc for each option
- [ ] Mark deprecated options
- [ ] Use TypeScript 4.x features (optional chaining, etc.)

---

## Phase 8: Testing & Documentation 📝

### Task 8.1: Add comprehensive tests

**Steps**:
- [ ] Review node-soap test suite
- [ ] Port relevant tests to ngx-soap
- [ ] Add tests for new features
- [ ] Add tests for bug fixes
- [ ] Ensure >80% code coverage

**Test categories**:
- [ ] WSDL parsing tests
- [ ] Client method tests
- [ ] Security protocol tests
- [ ] Error handling tests
- [ ] Edge case tests

---

### Task 8.2: Update README

**File**: `README.md`

**Steps**:
- [ ] Document new options
- [ ] Add migration guide
- [ ] Add examples for new features
- [ ] Update version compatibility matrix
- [ ] Add troubleshooting section

---

### Task 8.3: Add CHANGELOG

**New File**: `CHANGELOG.md`

**Steps**:
- [ ] Document all changes from backport
- [ ] Use semantic versioning
- [ ] Mark breaking changes clearly
- [ ] Credit node-soap project

---

## Testing Checklist Before Release

### Unit Tests
- [ ] All existing tests pass
- [ ] New tests for new features pass
- [ ] Code coverage > 80%

### Integration Tests
- [ ] Test with real SOAP services
- [ ] Test with various WSDL styles:
  - [ ] Document/literal
  - [ ] RPC/encoded
  - [ ] SOAP 1.1
  - [ ] SOAP 1.2
  - [ ] Mixed namespaces
  - [ ] Imported schemas

### Security Tests
- [ ] BasicAuthSecurity works
- [ ] BearerSecurity works
- [ ] ClientSSLSecurity works
- [ ] WSSecurity works
- [ ] WSSecurityCert works
- [ ] New security protocols work

### Browser Compatibility
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers

### Angular Compatibility
- [ ] Angular 17 (current)
- [ ] Angular 16
- [ ] Angular 15

### Performance Tests
- [ ] WSDL parsing is faster
- [ ] Request generation is faster
- [ ] Memory usage is acceptable
- [ ] Bundle size is acceptable

---

## Version Planning

### v0.18.0 (Patch - Immediate)
- xml-crypto update
- uuid replacement  
- sax update
- lodash update
- trim() optimization

**Risk**: Low  
**Timeline**: 1 week

---

### v0.19.0 (Minor - Short-term)
- Bug fixes (namespace, refs, empty body)
- New options (useEmptyTag, preserveWhitespace, normalizeNames)
- Performance improvements

**Risk**: Low-Medium  
**Timeline**: 2-3 weeks

---

### v0.20.0 (Minor - Medium-term)
- HTTP client abstraction
- Axios adapter (optional)
- New security protocols
- TypeScript improvements

**Risk**: Medium  
**Timeline**: 1-2 months

---

### v1.0.0 (Major - Long-term)
- Full axios migration (breaking change)
- Remove deprecated features
- Complete node-soap parity
- MTOM support (if needed)

**Risk**: High  
**Timeline**: 3-4 months

---

## Notes

### Breaking Changes to Avoid
- Maintain backward compatibility where possible
- Use feature flags for new behavior
- Provide migration guides
- Deprecate rather than remove

### Things to Keep from ngx-soap
- Angular HttpClient integration
- RxJS support
- Angular-specific features
- Existing API surface

### Things to Adapt, Not Copy
- Browser vs Node.js differences
- Angular-specific patterns
- Bundle size considerations
- Zone.js compatibility

---

## Success Criteria

✅ Phase 1 Complete When:
- [ ] All security dependencies updated
- [ ] All tests pass
- [ ] No new vulnerabilities
- [ ] Performance maintained or improved

✅ Phase 2 Complete When:
- [ ] Performance improvements measured
- [ ] New options work as expected
- [ ] Backward compatible

✅ Project Complete When:
- [ ] All major bugs fixed
- [ ] All critical features backported
- [ ] Test coverage >80%
- [ ] Documentation complete
- [ ] Released to npm
- [ ] User feedback positive

---

## Resources

- [node-soap GitHub](https://github.com/vpulim/node-soap)
- [node-soap History](https://github.com/vpulim/node-soap/blob/master/History.md)
- [xml-crypto v6 Migration Guide](https://github.com/node-saml/xml-crypto)
- [Axios Documentation](https://axios-http.com/)

---

## Getting Help

If you need help implementing any of these tasks:
1. Review the corresponding node-soap PR/commit
2. Check the node-soap tests for examples
3. Refer to the History.md for context
4. Ask in ngx-soap issues/discussions

