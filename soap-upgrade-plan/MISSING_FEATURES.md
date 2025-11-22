# Missing Features - Quick Reference

**Last Updated**: 2025-11-22  
**Current Parity**: 92% (36/39 core features)

---

## 🎯 3 Missing Features

### 1. ❌ Function-Based SOAP Headers with Context

**Priority**: MEDIUM  
**Effort**: 2-3 hours  
**node-soap PR**: #1315 (v1.3.0)

**What's Missing**:
```typescript
// ngx-soap currently doesn't support function-based headers with .apply()
// node-soap has _processSoapHeader method that handles this:

private _processSoapHeader(soapHeader, name, namespace, xmlns) {
  switch (typeof soapHeader) {
    case 'object':
      return this.wsdl.objectToXML(soapHeader, name, namespace, xmlns, true);
    case 'function': {
      const _this = this;
      return (...args: any) => {
        const result = soapHeader.apply(null, [...args]);
        if (typeof result === 'object') {
          return _this.wsdl.objectToXML(result, name, namespace, xmlns, true);
        }
        return result;
      };
    }
    default:
      return soapHeader;
  }
}
```

**Current ngx-soap** (`client.ts` lines 48-56):
```typescript
Client.prototype.addSoapHeader = function(soapHeader, name, namespace, xmlns) {
  if (!this.soapHeaders) {
    this.soapHeaders = [];
  }
  if (typeof soapHeader === 'object') {
    soapHeader = this.wsdl.objectToXML(soapHeader, name, namespace, xmlns, true);
  }
  return this.soapHeaders.push(soapHeader) - 1;
};
```

**Impact**:
- Enables dynamic SOAP headers via function callbacks
- Functions can access proper `this` context
- Useful for headers that change per request

**Usage Example** (if implemented):
```typescript
client.addSoapHeader((requestArgs) => {
  return {
    AuthToken: generateToken(requestArgs.userId)
  };
}, 'AuthHeader', 'http://example.com/auth');
```

**Files to Modify**:
- `projects/ngx-soap/src/lib/soap/client.ts`

**Implementation Steps**:
1. Add `_processSoapHeader` method to Client prototype
2. Update `addSoapHeader` to call `_processSoapHeader`
3. Update `changeSoapHeader` to call `_processSoapHeader`
4. Add tests for function-based headers

---

### 2. ⚠️ Schema Merge for Duplicate Namespaces

**Priority**: MEDIUM  
**Effort**: 1-2 hours  
**node-soap PR**: #1279 (v1.1.9)

**What's Missing**:
```typescript
// node-soap merges schemas when duplicate namespace is found
// ngx-soap only logs error

// Current ngx-soap (wsdl.ts lines 382-386):
if (!this.schemas.hasOwnProperty(targetNamespace)) {
  this.schemas[targetNamespace] = child;
} else {
  console.error('Target-Namespace "' + targetNamespace + '" already in use by another Schema!');
}

// node-soap (wsdl/elements.ts lines 853-858):
if (!Object.hasOwnProperty.call(this.schemas, targetNamespace)) {
  this.schemas[targetNamespace] = child;
} else {
  this.schemas[targetNamespace].merge(child);  // <-- Merges instead of error
}
```

**Impact**:
- Better handling of multiple WSDL imports with same namespace
- Prevents errors when importing related schema files
- Important for complex enterprise WSDLs

**Scenario**:
```xml
<!-- main.wsdl imports both schemas -->
<import schemaLocation="types1.xsd" namespace="http://example.com/types"/>
<import schemaLocation="types2.xsd" namespace="http://example.com/types"/>
<!-- Both use same namespace - should merge, not error -->
```

**Files to Modify**:
- `projects/ngx-soap/src/lib/soap/wsdl.ts` (TypesElement.prototype.addChild)

**Implementation Steps**:
1. Check if schema already exists
2. If exists, call `merge()` method (already exists in SchemaElement)
3. Remove console.error
4. Add tests for duplicate namespace scenarios

---

### 3. ⚠️ Import Namespace Fallback in TypesElement

**Priority**: LOW  
**Effort**: 30 minutes  
**node-soap PR**: #1296 (v1.2.0)

**What's Missing**:
```typescript
// Current ngx-soap (wsdl.ts line 380):
let targetNamespace = child.$targetNamespace;

// node-soap (wsdl/elements.ts line 851):
const targetNamespace = child.$targetNamespace || child.includes[0]?.namespace || childIncludeNs;
```

**Note**: SchemaElement.addChild already has the fallback (line 359), just TypesElement.addChild is missing it.

**Impact**:
- Edge case where schema doesn't have explicit targetNamespace
- Falls back to import/include namespace
- Rarely needed but improves robustness

**Files to Modify**:
- `projects/ngx-soap/src/lib/soap/wsdl.ts` (TypesElement.prototype.addChild)

**Implementation Steps**:
1. Add fallback logic: `child.$targetNamespace || (child.includes[0] && child.includes[0].namespace)`
2. Test with schema without targetNamespace

---

## 📊 Summary Table

| Feature | Priority | Effort | Impact | PR Reference |
|---------|----------|--------|--------|--------------|
| Function-based SOAP headers | Medium | 2-3h | Dynamic headers | #1315 |
| Schema namespace merge | Medium | 1-2h | Complex WSDLs | #1279 |
| Import namespace fallback | Low | 30m | Edge case | #1296 |
| **Total** | | **4-6h** | | |

---

## 🔧 Implementation Plan (Phase 6)

### Option A: Quick Win (1 feature)
**Time**: 30 minutes  
**Feature**: Import namespace fallback (#3)  
**Benefit**: Easy completion, low risk

### Option B: Medium Impact (2 features)
**Time**: 3-4 hours  
**Features**: Schema merge (#2) + Import fallback (#3)  
**Benefit**: Handles complex WSDLs better

### Option C: Complete Parity (3 features)
**Time**: 4-6 hours  
**Features**: All 3 missing features  
**Benefit**: 100% core feature parity with node-soap

---

## 📝 Testing Requirements

### For Each Feature

1. **Unit Tests**:
   - Test new functionality
   - Test edge cases
   - Test backward compatibility

2. **Integration Tests**:
   - Test with real WSDL files
   - Test with existing test suite (should still pass 249/249)

3. **Regression Tests**:
   - Ensure no breaking changes
   - Verify existing functionality still works

---

## ⏭️ Deferred Items (Not Urgent)

These 5 items are intentionally deferred (no immediate action needed):

1. **Namespace prefix parsing optimization** (#1347) - Performance
2. **WSDL parsing speed improvements** (#1218, #1322) - Performance
3. **Deeply nested message handling** (#1313) - Edge case
4. **XML processing improvements** - Edge case
5. **WSDL attributes enhancements** - Edge case

**Reason**: Current implementation works well, no user reports, would require significant refactoring for minimal benefit.

---

## 🎯 Recommendation

**Implement Option C** (all 3 features) for these reasons:

1. **Small time investment** (4-6 hours) for 100% parity
2. **Medium impact** on complex WSDL scenarios
3. **Future-proof** ngx-soap against edge cases
4. **Professional completeness** for enterprise use

**When to Implement**:
- Before v1.0.0 release
- Before marketing as "feature-complete with node-soap"
- When targeting enterprise customers with complex WSDLs

**When NOT to Implement**:
- If current 92% parity is sufficient
- If no users report issues with these scenarios
- If development resources are limited

---

**Status**: ⏳ Pending Decision  
**Current Version**: 0.18.1 (92% parity) ✅ Production Ready  
**Target Version**: 0.19.0 (100% parity) if Phase 6 is implemented

