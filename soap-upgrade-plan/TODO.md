# ngx-soap Backport Progress

**Status**: Phase 1-5 Complete ✅  
**Tests**: 249 passing | **Breaking Changes**: 0  
**Feature Parity**: 90% with node-soap v1.6.0  
**Version**: 0.18.1 ready for release

> **Technical Details**: See [BACKPORT_INFO.md](./BACKPORT_INFO.md)

---

## Phase Progress

| Phase | Tasks | Tests | Status | Key Features |
|-------|-------|-------|--------|--------------|
| 1 | 7/7 | 149 | ✅ | xml-crypto v6.1.2, crypto.randomUUID(), trim() |
| 2 | 7/7 | 157 | ✅ | Empty body, SOAP Fault, Map namespaces |
| 3 | 7/7 | 199 | ✅ | 8 options, WSSecurityCertWithToken, WSSecurityPlusCert |
| 4A | 4/4 | 211 | ✅ | Missing messages, $type fix, multi-service/port |
| 4B | 5/7 | 223 | ✅ | Security algorithms, envelopeSoapUrl, overrideElementKey |
| 4C | 3/5 | 235 | ✅ | Encoding, wsdlCache, excludeReferencesFromSigning |
| 5 | 3/4 | 249 | ✅ | appendElement, envelopeKey (WSSecurity) |

**Completed**: 36/41 tasks (88%)  
**Deferred**: 5 tasks (optimizations & edge cases)

---

## ✅ Phase 1: Security & Dependencies

**Completed**: 2025-11-22 | Commit: `e5969d7`

- [x] xml-crypto v2.1.6 → v6.1.2
- [x] Remove uuid → crypto.randomUUID()
- [x] Native String.trim()
- [x] Update: sax v1.4.1, lodash v4.17.21, debug v4.4.3

---

## ✅ Phase 2: Bug Fixes & Performance

**Completed**: 2025-11-22 | Commit: `b8c1fc3`

- [x] Empty SOAP body handling
- [x] SOAP Fault 1.1/1.2 + `returnFault` option
- [x] Element reference $ref resolution
- [x] Array namespace inheritance + `namespaceArrayElements`
- [x] Map-based namespace lookups

---

## ✅ Phase 3: Options & Features

**Completed**: 2025-11-22

- [x] 8 new options: `useEmptyTag`, `preserveWhitespace`, `normalizeNames`, `suppressStack`, `forceUseSchemaXmlns`, `envelopeKey`, `overridePromiseSuffix`, `exchangeId`
- [x] WSSecurityCertWithToken (Certificate + Username Token)
- [x] WSSecurityPlusCert (Combined WS-Security)
- [x] Exchange ID (EID) tracking
- [x] Comprehensive JSDoc

---

## ✅ Phase 4A: Critical Fixes

**Completed**: 2025-11-22

- [x] Handle missing message definitions
- [x] Prevent $type mutation (_.cloneDeep)
- [x] Multi-service/port: `serviceName`, `portName`
- [x] ComplexContent with RestrictionElement

---

## ✅ Phase 4B: Medium Priority

**Completed**: 2025-11-22

- [x] `overrideElementKey` option
- [x] `envelopeSoapUrl` option
- [x] Security: `digestAlgorithm`, `signatureAlgorithm`
- [x] Remove hardcoded timestamp IDs
- [x] Fix xmlns:wsu spacing
- [ ] Namespace improvements ⏭️ **DEFERRED**
- [ ] WSDL optimizations ⏭️ **DEFERRED**

---

## ✅ Phase 4C: Low Priority

**Completed**: 2025-11-22

- [x] `excludeReferencesFromSigning` option
- [x] `encoding` option
- [x] Custom WSDL cache: `IWSDLCache`, `wsdlCache`
- [ ] XML processing improvements ⏭️ **DEFERRED**
- [ ] Performance optimizations ⏭️ **DEFERRED**

---

## ✅ Phase 5: Security Enhancements

**Completed**: 2025-11-22

- [x] `appendElement` for WSSecurity
- [x] `appendElement` for WSSecurityCert
- [x] `envelopeKey` for WSSecurity
- [x] WSSecurityCertWithToken updated
- [ ] WSDL attributes ⏭️ **DEFERRED**

**Implementation**:
```typescript
// WSSecurity with custom elements
new WSSecurity('user', 'pass', {
  appendElement: '<custom:Token>ABC</custom:Token>',
  envelopeKey: 'SOAP-ENV'
});

// WSSecurityCert with custom elements
new WSSecurityCert(privateKey, publicKey, password, {
  appendElement: '<custom:Sig>XYZ</custom:Sig>'
});
```

---

## Configuration Summary

### Client Options (16)
```typescript
createClient(url, {
  // Phase 2
  returnFault?: boolean;
  namespaceArrayElements?: boolean;
  
  // Phase 3
  useEmptyTag?: boolean;
  preserveWhitespace?: boolean;
  normalizeNames?: boolean;
  suppressStack?: boolean;
  forceUseSchemaXmlns?: boolean;
  envelopeKey?: string;
  overridePromiseSuffix?: string;
  exchangeId?: string;
  
  // Phase 4
  serviceName?: string;
  portName?: string;
  overrideElementKey?: { [key: string]: string };
  envelopeSoapUrl?: string;
  encoding?: string;
  wsdlCache?: IWSDLCache;
});
```

### WSSecurity Options (9)
```typescript
new WSSecurity(username, password, {
  passwordType?: 'PasswordText' | 'PasswordDigest';
  hasTimeStamp?: boolean;
  hasNonce?: boolean;
  hasTokenCreated?: boolean;
  actor?: string;
  mustUnderstand?: boolean;
  envelopeKey?: string;        // Phase 5
  appendElement?: string;      // Phase 5
});
```

### WSSecurityCert Options (5)
```typescript
new WSSecurityCert(privateKey, publicKey, password, {
  digestAlgorithm?: 'sha1' | 'sha256' | 'sha512';
  signatureAlgorithm?: string;
  excludeReferencesFromSigning?: string[];
  appendElement?: string;      // Phase 5
});
```

---

## Deferred Tasks

| Task | Phase | Reason | Priority |
|------|-------|--------|----------|
| Namespace improvements | 4B | Complex refactoring | LOW |
| WSDL parsing optimizations | 4B | Needs benchmarking | LOW |
| XML processing improvements | 4C | Current impl robust | LOW |
| Performance optimizations | 4C | Key opts complete | LOW |
| WSDL attributes | 5 | Edge case, no reports | LOW |

**Decision**: Defer until specific use cases or benchmarks justify the effort.

---

## Test Coverage

```
Phase 1:   149 tests ✅
Phase 2:   157 tests ✅ (+8)
Phase 3:   199 tests ✅ (+42)
Phase 4A:  211 tests ✅ (+12)
Phase 4B:  223 tests ✅ (+12)
Phase 4C:  235 tests ✅ (+12)
Phase 5:   249 tests ✅ (+14)

Total: 249 passing | 1 skipped
```

**Categories**: Client ops, WSDL parsing, Security (6 protocols), Config options, Error handling

---

## Version Roadmap

- **v0.17.0**: Original baseline (2016)
- **v0.18.0**: Phases 1-4 ✅ (89% parity)
- **v0.18.1**: Phase 5 ✅ (90% parity) ← **Current**
- **v0.19.0**: Deferred tasks (if justified)
- **v1.0.0**: Full parity target

---

## Files Modified

### Core (4)
- `wsdl.ts` - Parsing, elements, options
- `client.ts` - Operations, multi-service
- `interfaces.ts` - TypeScript definitions
- `nscontext.ts` - Map namespaces

### Security (6)
- `WSSecurity.ts` - envelopeKey, appendElement
- `WSSecurityCert.ts` - appendElement, algorithms
- `WSSecurityCertWithToken.ts` ⭐ NEW
- `WSSecurityPlusCert.ts` ⭐ NEW
- `BasicAuthSecurity.ts`, `BearerSecurity.ts`

### Tests (12 suites)
- All security protocol tests
- `wsdl.spec.ts`, `client-operations.spec.ts`
- +100 new tests across phases

---

## Quick Commands

```bash
# Test
npm run test:lib

# Build
npm run build:lib

# Search
grep -r "pattern" projects/ngx-soap/src/ --include="*.ts"
```

---

## Documentation

- **[BACKPORT_INFO.md](./BACKPORT_INFO.md)** - Complete technical reference with code examples
- **[../CHANGELOG.md](../CHANGELOG.md)** - Version history
- **[../README.md](../README.md)** - Usage guide

---

**Last Updated**: 2025-11-22  
**Status**: Production Ready ✅  
**Ready for Release**: v0.18.1
