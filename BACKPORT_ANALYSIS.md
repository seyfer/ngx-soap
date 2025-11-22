# Backport Analysis: node-soap v1.6.0 → ngx-soap v0.17.0

## Version Gap Overview

- **ngx-soap (current)**: v0.17.0 (based on node-soap ~v0.17.0 from 2016)
- **node-soap (latest)**: v1.6.0 (October 2025)
- **Gap**: ~9 years of improvements and 89 major/minor releases

## Executive Summary

The node-soap library has undergone significant modernization and improvements since v0.17.0. Key changes include:

1. **HTTP Client Migration**: Request module → Axios (v0.40.0, 2021)
2. **TypeScript Conversion**: Full TypeScript rewrite (v0.27.0, 2019)
3. **Dependency Updates**: Modern, secure dependencies
4. **Performance Improvements**: Faster WSDL parsing and XML processing
5. **Enhanced Security**: Updated crypto implementations and security protocols
6. **Bug Fixes**: Hundreds of bug fixes and edge case handling
7. **New Features**: MTOM, streaming, better SOAP 1.2 support

---

## Critical Improvements Worth Backporting

### 1. HTTP Client Migration (Priority: HIGH)

**Original**: node-soap v0.40.0 (July 2021)
**Status**: node-soap migrated from deprecated `request` module to `axios`

**Benefits**:
- `request` module is deprecated and unmaintained since 2020
- Axios is actively maintained with security updates
- Better TypeScript support
- Modern promise-based API
- Smaller bundle size

**Effort**: MEDIUM-HIGH (requires significant refactoring)

**Files to Update**:
- `projects/ngx-soap/src/lib/soap/http.ts`
- `projects/ngx-soap/src/lib/soap/client.ts`
- Dependencies in `package.json`

**Dependencies to Add**:
```json
{
  "axios": "^1.13.1",
  "axios-ntlm": "^1.4.6"
}
```

**Dependencies to Remove**:
```json
{
  "httpntlm": "^1.7.6"
}
```

---

### 2. Security Enhancements (Priority: HIGH)

#### 2.1 xml-crypto Update
**Version Gap**: Current (^2.1.6) → Latest (^6.1.2)
**Changes**: Multiple security fixes and improvements

**Files to Update**:
- `package.json`
- Security-related code in `projects/ngx-soap/src/lib/soap/security/`

#### 2.2 UUID Replacement
**Original**: node-soap v1.1.0 (July 2024)
**Change**: Deprecated `uuid` package → Built-in `crypto.randomUUID()`

**Benefits**:
- One less dependency
- Native Node.js/Browser support
- Better performance

**Files to Update**:
- Any file using UUID generation
- Remove `uuid` from dependencies

#### 2.3 New Security Protocols

**Added in node-soap**:
- `WSSecurityCertWithToken` - WS-Security with username token (v1.0.3, 2024)
- `WSSecurityPlusCert` - Combined WSSecurity and WSSecurityCert (v1.0.0, 2022)
- Improved NTLM support (v0.25.0, 2018)
- Bearer Token authentication (v0.6.0, 2014)

**Files to Check**:
- `projects/ngx-soap/src/lib/soap/security/`

---

### 3. Performance Improvements (Priority: MEDIUM-HIGH)

#### 3.1 Faster WSDL Parsing
**Original**: node-soap v1.0.4 (June 2024) & v1.3.0 (Aug 2025)
**Improvement**: Optimized namespace handling and parsing speed

**Benefits**:
- Faster client initialization
- Reduced memory usage
- Better handling of large WSDL files

**Files to Update**:
- `projects/ngx-soap/src/lib/soap/wsdl.ts`
- `projects/ngx-soap/src/lib/soap/nscontext.ts`

#### 3.2 Improved XML Trimming
**Original**: node-soap v1.0.2 (April 2024)
**Change**: Faster trim implementation during XML parsing

**Current Code** (ngx-soap):
```typescript
let trimLeft = /^[\s\xA0]+/;
let trimRight = /[\s\xA0]+$/;

function trim(text) {
  return text.replace(trimLeft, '').replace(trimRight, '');
}
```

**New Code** (node-soap):
```typescript
function trim(text) {
  return text.trim();  // Use native String.trim()
}
```

---

### 4. Bug Fixes and Edge Cases (Priority: HIGH)

#### 4.1 Namespace Handling
**Multiple fixes** between v0.18.0 - v1.6.0:
- Fixed namespace prefix issues in nested elements
- Better handling of default namespaces
- Correct namespace for array elements
- Support for multiple schemas with same namespace but different prefixes

**Key Changes**:
- v1.5.0: Handle different namespace prefix for same namespace (requires `forceUseSchemaXmlns` option)
- v1.4.0: Fix hardcoded namespace prefixes in parsing
- v1.3.0: Speed up parsing with many namespaces
- v0.26.0: Better schema cross-reference resolution

#### 4.2 Element Reference Handling
**Fixes**:
- v1.4.0: Convert ref attributes to list
- v1.1.6: Fix usage of ref maxoccurs and minoccurs attributes
- v0.32.0: Add support for xsd element ref

#### 4.3 SOAP Fault Handling
**Improvements**:
- v0.42.0: SOAP faults properly passed in error callback
- v0.6.0: Better fault handling and error messages
- Support for custom statusCode in SOAP faults

---

### 5. New Features (Priority: MEDIUM)

#### 5.1 MTOM Support
**Added**: node-soap v0.27.0 (April 2019)
**Enhancement**: v1.1.1 (Aug 2024) - Support binary data in MTOM

**Benefits**:
- Handle binary attachments in SOAP requests/responses
- Support for multipart/related content

**New Options**:
```typescript
{
  attachments: [{
    mimetype: string,
    contentId: string,
    name: string,
    body: Buffer
  }],
  forceMTOM: boolean,
  parseReponseAttachments: boolean,
  encoding: string  // Default: 'utf8'
}
```

#### 5.2 Streaming Support
**Added**: node-soap v0.18.0 (2016)
**Enhancement**: v0.33.0 (2020) - Return SAX stream option

**Benefits**:
- Memory-efficient handling of large responses
- Progressive parsing

**New Options**:
```typescript
{
  stream: boolean,           // Use streams to parse XML
  returnSaxStream: boolean   // Return SAX stream to user
}
```

#### 5.3 Custom Deserializer
**Added**: node-soap v0.21.0 (2017)

**Benefits**:
- Custom handling of date formats
- Type conversion control

**Example**:
```typescript
const wsdlOptions = {
  customDeserializer: {
    date: function(text, context) {
      // Custom date parsing
      return text;
    }
  }
};
```

#### 5.4 Additional Options

**WSDL Options** (added over time):
- `disableCache` - Prevent WSDL caching (v0.17.0)
- `wsdlCache` - Custom cache implementation (v1.1.6, 2024)
- `overridePromiseSuffix` - Change Async suffix (v0.22.0)
- `normalizeNames` - Replace non-identifier chars (v0.23.0)
- `useEmptyTag` - Self-closing tags (v0.21.0)
- `escapeXML` - Control XML escaping (v0.17.0)
- `preserveWhitespace` - Keep leading/trailing whitespace (v0.22.0)
- `overrideElementKey` - Change element keys (v1.4.0)
- `forceUseSchemaXmlns` - Force schema xmlns usage (v1.5.0)
- `envelopeKey` - Custom envelope key (v0.14.0)
- `envelopeSoapUrl` - Custom xmlns:soap URL (v1.0.4)

---

### 6. TypeScript Improvements (Priority: MEDIUM)

**Conversion**: node-soap v0.27.0 (April 2019)
**Ongoing**: Type definition improvements in every release

**Benefits**:
- Better IDE support
- Type safety
- Self-documenting code

**Your Status**: ngx-soap already has some TypeScript, but could benefit from:
- Updated type definitions
- Better interface definitions
- Generic type support

**Files to Review**:
- `projects/ngx-soap/src/lib/soap/_soap.d.ts`
- `projects/ngx-soap/src/lib/soap/interfaces.ts`

---

### 7. Dependency Updates (Priority: HIGH)

| Dependency | ngx-soap | node-soap | Notes |
|------------|----------|-----------|-------|
| sax | ^1.2.4 | ^1.4.1 | Security & bug fixes |
| xml-crypto | ^2.1.6 | ^6.1.2 | **Critical security updates** |
| lodash | ^4.17.10 | ^4.17.21 | Security fixes |
| uuid | ^3.3.2 | ❌ (removed) | Use native crypto |
| axios | ❌ | ^1.13.1 | **New: replaces request** |
| axios-ntlm | ❌ | ^1.4.6 | **New: for NTLM** |
| debug | ❌ | ^4.4.3 | **New: better debugging** |
| get-stream | ❌ | ^6.0.1 | **New: for streaming** |
| strip-bom | ❌ | ^3.0.0 | **New: BOM handling** |
| formidable | ❌ | ^3.5.4 | **New: for multipart** |

---

## Recommended Backport Strategy

### Phase 1: Critical Security & Dependencies (Immediate)

1. **Update xml-crypto** to v6.x
   - Test all WS-Security implementations
   - Update signature algorithms if needed

2. **Replace uuid with crypto.randomUUID()**
   - Search for all uuid usage
   - Replace with native implementation

3. **Update sax and lodash**
   - Update to latest versions
   - Run full test suite

**Estimated Effort**: 2-3 days
**Risk**: Low-Medium

---

### Phase 2: HTTP Client Migration (Short-term)

1. **Migrate from httpntlm to axios + axios-ntlm**
   - Refactor `http.ts`
   - Update client request handling
   - Update NTLM security

2. **Add debug package** for better logging

3. **Comprehensive testing**
   - Test all HTTP methods
   - Test NTLM authentication
   - Test SSL/TLS connections

**Estimated Effort**: 1-2 weeks
**Risk**: Medium-High

---

### Phase 3: Bug Fixes & Performance (Medium-term)

1. **Apply namespace handling fixes**
   - Study changes from v0.18-v1.6
   - Test with various WSDL files

2. **Implement performance improvements**
   - WSDL parsing optimizations
   - XML trimming updates

3. **Fix element reference handling**

**Estimated Effort**: 2-3 weeks
**Risk**: Medium

---

### Phase 4: New Features (Long-term)

1. **Add MTOM support** (if needed)
2. **Add streaming support** (if needed)
3. **Implement custom deserializer**
4. **Add new WSDL options**

**Estimated Effort**: 3-4 weeks per feature
**Risk**: Low-Medium

---

## Testing Requirements

### Critical Test Areas

1. **WSDL Parsing**
   - Simple WSDL files
   - Complex WSDL with multiple imports
   - WSDL with various namespace styles

2. **SOAP Requests**
   - Basic requests
   - Complex types
   - Arrays
   - Nested objects
   - Attributes

3. **Security**
   - BasicAuthSecurity
   - BearerSecurity
   - ClientSSLSecurity
   - WSSecurity variants
   - NTLM

4. **Error Handling**
   - SOAP Faults
   - Network errors
   - Invalid WSDL
   - Invalid responses

5. **Angular Integration**
   - HttpClient compatibility
   - RxJS integration
   - Zone.js compatibility

---

## Risks and Considerations

### High Risk

1. **Breaking Changes**
   - HTTP client migration will require API changes
   - Some options/behaviors may change
   - Existing code may need updates

2. **Angular Compatibility**
   - node-soap is designed for Node.js
   - Need to ensure browser compatibility
   - HttpClient integration must be maintained

### Medium Risk

1. **Testing Coverage**
   - Limited test coverage in current ngx-soap
   - Need comprehensive test suite before major changes

2. **Dependency Size**
   - New dependencies increase bundle size
   - Need to evaluate impact on Angular apps

### Low Risk

1. **TypeScript Migration**
   - Already using TypeScript
   - Type updates are generally safe

---

## Files Requiring Updates

### High Priority

- `package.json` - Update dependencies
- `projects/ngx-soap/src/lib/soap/http.ts` - HTTP client migration
- `projects/ngx-soap/src/lib/soap/client.ts` - Client updates
- `projects/ngx-soap/src/lib/soap/wsdl.ts` - WSDL parsing improvements
- `projects/ngx-soap/src/lib/soap/security/*` - Security updates

### Medium Priority

- `projects/ngx-soap/src/lib/soap/nscontext.ts` - Namespace handling
- `projects/ngx-soap/src/lib/soap/interfaces.ts` - Type definitions
- `projects/ngx-soap/src/lib/soap/utils.ts` - Utility functions

### Low Priority

- Test files - Add comprehensive tests
- Documentation - Update with new features

---

## Compatibility Matrix

| Feature | node-soap | Can Backport? | Notes |
|---------|-----------|---------------|-------|
| Axios HTTP | ✅ | ✅ | Need adapter for Angular HttpClient |
| xml-crypto v6 | ✅ | ✅ | Direct update |
| MTOM | ✅ | ⚠️ | May need browser polyfills |
| Streaming | ✅ | ⚠️ | Limited in browser |
| Debug package | ✅ | ✅ | Works in browser |
| Native UUID | ✅ | ✅ | Supported in modern browsers |
| NTLM with axios-ntlm | ✅ | ⚠️ | May not work in browser |
| TypeScript improvements | ✅ | ✅ | Fully compatible |
| All bug fixes | ✅ | ✅ | Logic-based, platform agnostic |

✅ = Fully compatible
⚠️ = Requires adaptation
❌ = Not compatible

---

## Recommended Next Steps

1. **Review this analysis** with the team
2. **Prioritize which phases** to implement
3. **Set up comprehensive testing** environment
4. **Start with Phase 1** (security updates)
5. **Create feature branches** for each phase
6. **Gradual rollout** with beta versions
7. **Gather feedback** from users

---

## Quick Wins (Can implement immediately)

These are low-risk, high-value changes that can be implemented quickly:

1. **Replace trimLeft/trimRight regex with native trim()**
   ```typescript
   // Old
   function trim(text) {
     return text.replace(trimLeft, '').replace(trimRight, '');
   }
   
   // New
   function trim(text) {
     return text.trim();
   }
   ```

2. **Replace uuid with crypto.randomUUID()**
   ```typescript
   // Old
   import * as uuid from 'uuid';
   const id = uuid.v4();
   
   // New
   import { randomUUID } from 'crypto';
   const id = randomUUID();
   ```

3. **Update lodash usage to avoid deprecated methods**

4. **Add debug statements** for better troubleshooting

5. **Update TSConfig** for modern TypeScript features

---

## Conclusion

The node-soap library has matured significantly since v0.17.0. The most critical improvements to backport are:

1. **Security updates** (xml-crypto, uuid replacement)
2. **HTTP client migration** (to axios)
3. **Bug fixes** (namespace handling, element references)
4. **Performance improvements** (WSDL parsing)

The estimated effort for all phases is **2-3 months** of development time, but the benefits include:

- ✅ Better security
- ✅ Improved performance
- ✅ More features
- ✅ Better maintainability
- ✅ Active dependency support
- ✅ Hundreds of bug fixes

**Recommendation**: Start with Phase 1 (security) immediately, then plan Phase 2 (HTTP migration) for next quarter.

