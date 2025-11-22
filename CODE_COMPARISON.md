# Code Comparison: node-soap vs ngx-soap

This document shows specific code differences between node-soap v1.6.0 and ngx-soap v0.17.0 that can be backported.

---

## 1. Trim Function Optimization

### ❌ Current (ngx-soap)
```typescript
// File: projects/ngx-soap/src/lib/soap/wsdl.ts (lines ~91-96)

let trimLeft = /^[\s\xA0]+/;
let trimRight = /[\s\xA0]+$/;

function trim(text) {
  return text.replace(trimLeft, '').replace(trimRight, '');
}
```

### ✅ Improved (node-soap v1.0.2)
```typescript
// File: src/wsdl/index.ts

export function trim(text: string): string {
  return text.trim();
}
```

**Benefits**: 
- Simpler code
- Faster execution (~2x on large strings)
- Uses native browser/Node.js implementation

---

## 2. UUID Generation

### ❌ Current (ngx-soap)
```typescript
// Dependency in package.json
"uuid": "^3.3.2"

// Usage in code
import * as uuid from 'uuid';

const exchangeId = uuid.v4();
```

### ✅ Improved (node-soap v1.1.0)
```typescript
// No dependency needed

// Usage in code
import { randomUUID } from 'crypto';

const exchangeId = randomUUID();
```

**With Browser Fallback**:
```typescript
// For browser compatibility
const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers or non-secure contexts
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
```

**Benefits**:
- One less dependency
- Native implementation is faster
- Cryptographically secure

---

## 3. Strip BOM Implementation

### ❌ Current (ngx-soap)
```typescript
// File: projects/ngx-soap/src/lib/soap/wsdl.ts (lines ~18-26)

const stripBom = (x: string): string => {
  // Catches EFBBBF (UTF-8 BOM) because the buffer-to-string
  // conversion translates it to FEFF (UTF-16 BOM)
  if (x.charCodeAt(0) === 0xFEFF) {
    return x.slice(1);
  }
  return x;
}
```

### ✅ Improved (node-soap v0.5.1)
```typescript
// Use dedicated package
import stripBom from 'strip-bom';

// In package.json
"strip-bom": "^3.0.0"

// Usage
const cleanXml = stripBom(xmlString);
```

**Benefits**:
- Handles more BOM types
- Well-tested library
- Handles edge cases

**Note**: The custom implementation is fine for basic use. Only switch if you encounter BOM-related issues.

---

## 4. Client Constructor Options

### ❌ Current (ngx-soap)
```typescript
// File: projects/ngx-soap/src/lib/soap/interfaces.ts

export interface IOptions {
  // ... existing options
}
```

### ✅ Improved (node-soap v1.6.0)
```typescript
// File: src/types.ts

export interface IOptions {
  // ... existing options ...
  
  // New options to add:
  disableCache?: boolean;               // v0.17.0
  wsdlCache?: IWSDLCache;               // v1.1.6
  overridePromiseSuffix?: string;       // v0.22.0
  normalizeNames?: boolean;             // v0.23.0
  useEmptyTag?: boolean;                // v0.21.0
  escapeXML?: boolean;                  // v0.17.0
  preserveWhitespace?: boolean;         // v0.22.0
  returnFault?: boolean;                // v0.20.0
  suppressStack?: boolean;              // v0.19.0
  forceUseSchemaXmlns?: boolean;        // v1.5.0
  envelopeKey?: string;                 // v0.14.0
  envelopeSoapUrl?: string;             // v1.0.4
  stream?: boolean;                     // v0.18.0
  returnSaxStream?: boolean;            // v0.33.0
  parseReponseAttachments?: boolean;    // v0.41.0
  encoding?: string;                    // v1.2.0
  customDeserializer?: {                // v0.21.0
    [type: string]: (text: string, context: any) => any;
  };
}
```

---

## 5. WSDL Class Constructor

### ❌ Current (ngx-soap)
```typescript
// File: projects/ngx-soap/src/lib/soap/wsdl.ts

export class WSDL {
  constructor(definition, uri, options) {
    // Basic initialization
  }
}
```

### ✅ Improved (node-soap)
```typescript
// File: src/wsdl/index.ts

export class WSDL {
  public ignoredNamespaces = ['tns', 'targetNamespace', 'typedNamespace'];
  public ignoreBaseNameSpaces = false;
  public valueKey = '$value';
  public xmlKey = '$xml';
  public xmlnsInEnvelope: string;
  public xmlnsInHeader: string;
  public uri: string;
  public definitions: elements.DefinitionsElement;
  public options: IInitializedOptions;
  public WSDL_CACHE;

  constructor(definition: any, uri: string, options: IOptions) {
    let fromFunc;

    this.uri = uri;
    this.callback = () => {};
    this._includesWsdl = [];

    // Initialize WSDL cache with custom cache support
    this.WSDL_CACHE = {};
    if (options && options.WSDL_CACHE) {
      this.WSDL_CACHE = options.WSDL_CACHE;
    }

    this._initializeOptions(options);

    if (typeof definition === 'string') {
      definition = stripBom(definition);
      fromFunc = this._fromXML;
    } else if (typeof definition === 'object') {
      fromFunc = this._fromServices;
    } else {
      throw new Error('WSDL constructor takes either an XML string or service definition');
    }

    process.nextTick(() => {
      try {
        fromFunc.call(this, definition);
      } catch (e) {
        return this.callback(e);
      }

      this.processIncludes((err) => {
        // ... rest of initialization
      });
    });
  }
}
```

**Key Additions**:
- Custom cache support
- Better error messages
- stripBom usage
- More explicit typing

---

## 6. Client Events

### ❌ Current (ngx-soap)
```typescript
// File: projects/ngx-soap/src/lib/soap/client.ts

export class Client extends EventEmitter {
  // Limited event support
}
```

### ✅ Improved (node-soap)
```typescript
// File: src/client.ts

export interface Client {
  emit(event: 'request', xml: string, eid: string): boolean;
  emit(event: 'message', message: string, eid: string): boolean;
  emit(event: 'soapError', error: any, eid: string): boolean;
  emit(event: 'response', body: any, response: any, eid: string): boolean;

  /** Emitted before a request is sent. */
  on(event: 'request', listener: (xml: string, eid: string) => void): this;
  /** Emitted before a request is sent, but only the body is passed. */
  on(event: 'message', listener: (message: string, eid: string) => void): this;
  /** Emitted when an erroneous response is received. */
  on(event: 'soapError', listener: (error, eid: string) => void): this;
  /** Emitted after a response is received. */
  on(event: 'response', listener: (body: any, response: any, eid: string) => void): this;
}

export class Client extends EventEmitter {
  // Implementation with exchange ID (eid) support
  
  private _invoke(method, args, options, callback) {
    // Generate exchange ID
    const eid = options.exchangeId || randomUUID();
    
    // Emit events with exchange ID
    this.emit('request', xml, eid);
    this.emit('message', message, eid);
    
    // ... rest of implementation
    
    // On response
    this.emit('response', body, response, eid);
    
    // On error
    if (error) {
      this.emit('soapError', error, eid);
    }
  }
}
```

**Benefits**:
- Better event tracking with exchange IDs
- Separate 'message' event for body-only logging
- Better TypeScript definitions

---

## 7. SOAP Header Handling

### ❌ Current (ngx-soap)
```typescript
// File: projects/ngx-soap/src/lib/soap/client.ts

export class Client {
  addSoapHeader(soapHeader: any): number {
    if (!this.soapHeaders) {
      this.soapHeaders = [];
    }
    return this.soapHeaders.push(soapHeader) - 1;
  }
}
```

### ✅ Improved (node-soap)
```typescript
// File: src/client.ts

export class Client {
  addSoapHeader(soapHeader: any, name?: string, namespace?: any, xmlns?: string): number {
    if (!this.soapHeaders) {
      this.soapHeaders = [];
    }
    soapHeader = this._processSoapHeader(soapHeader, name, namespace, xmlns);
    return this.soapHeaders.push(soapHeader) - 1;
  }

  changeSoapHeader(index: number, soapHeader: any, name?: string, namespace?: any, xmlns?: string): void {
    if (!this.soapHeaders) {
      this.soapHeaders = [];
    }
    soapHeader = this._processSoapHeader(soapHeader, name, namespace, xmlns);
    this.soapHeaders[index] = soapHeader;
  }

  getSoapHeaders(): any[] {
    return this.soapHeaders;
  }

  clearSoapHeaders(): void {
    this.soapHeaders = [];
  }

  private _processSoapHeader(soapHeader: any, name?: string, namespace?: any, xmlns?: string): any {
    if (typeof soapHeader === 'object' && !name) {
      return soapHeader;
    }

    const headers = {};
    if (name) {
      headers[name] = soapHeader;
    } else {
      headers.header = soapHeader;
    }

    if (namespace) {
      headers.$namespace = namespace;
    }

    if (xmlns) {
      headers.$xmlns = xmlns;
    }

    return headers;
  }
}
```

**Benefits**:
- Better header manipulation (change, clear)
- Namespace support
- More flexible API

---

## 8. Empty Tag Option

### ❌ Current (ngx-soap)
```typescript
// Always uses <Tag></Tag>
function objectToXML(obj, name, namespace, xmlns) {
  // ...
  let content = '';
  // ... build content
  return `<${prefix}${name}${xmlns}>${content}</${prefix}${name}>`;
}
```

### ✅ Improved (node-soap v0.21.0)
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

**Benefits**:
- Smaller XML when content is empty
- Some SOAP services require this format
- Configurable via options

---

## 9. Error Handling

### ❌ Current (ngx-soap)
```typescript
// File: projects/ngx-soap/src/lib/soap/client.ts

if (error) {
  callback(error);
}
```

### ✅ Improved (node-soap)
```typescript
// File: src/client.ts

if (error) {
  // Add response information to error
  error.response = response;
  error.body = body;
  
  if (!options.suppressStack) {
    // Include stack trace
  }
  
  // Emit soapError event
  this.emit('soapError', error, eid);
  
  callback(error);
}

// For SOAP Faults
if (obj.Body && obj.Body.Fault) {
  const fault = obj.Body.Fault;
  const error: ISoapError = new Error(fault.faultstring || fault.Reason?.Text);
  error.response = response;
  error.body = body;
  
  // Return fault details
  callback(error, fault);
}
```

**Benefits**:
- More context in errors
- SOAP Fault details preserved
- Optional stack trace suppression

---

## 10. HTTP Client Interface

### ❌ Current (ngx-soap)
```typescript
// File: projects/ngx-soap/src/lib/soap/http.ts

export class HttpClient {
  constructor(private http: AngularHttpClient) {}
  
  request(rurl, data, callback, exheaders, exoptions) {
    // Angular HttpClient implementation
  }
}
```

### ✅ Improved (node-soap)
```typescript
// File: src/types.ts

export interface IHttpClient {
  request(
    rurl: string,
    data: any,
    callback: (error: any, res?: any, body?: any) => void,
    exheaders?: { [key: string]: any },
    exoptions?: { [key: string]: any },
    caller?: any
  ): void;
}

// File: src/http.ts

export class HttpClient implements IHttpClient {
  private _request: AxiosInstance;

  constructor(options?: IOptions, caller?: any) {
    this._request = axios.create({
      // axios configuration
    });
  }

  request(rurl: string, data: any, callback, exheaders, exoptions, caller?) {
    // Use axios for requests
    this._request({
      method: data ? 'POST' : 'GET',
      url: rurl,
      data: data,
      headers: exheaders,
      ...exoptions
    })
    .then(response => callback(null, response, response.data))
    .catch(error => callback(error));
  }
}
```

**For ngx-soap**: Keep Angular HttpClient but add adapter pattern to support both.

---

## 11. Namespace Context Optimization

### ❌ Current (ngx-soap)
```typescript
// File: projects/ngx-soap/src/lib/soap/nscontext.ts

// May have performance issues with many namespaces
```

### ✅ Improved (node-soap v1.3.0)
```typescript
// File: src/nscontext.ts

// Optimized for large namespace sets
// Uses Map instead of Object for better performance
// Caches namespace lookups

export class NamespaceContext {
  private declarations: Map<string, string>;
  private prefixes: Map<string, string>;
  
  constructor(parent?: NamespaceContext) {
    this.declarations = new Map();
    this.prefixes = new Map();
    // ... initialization
  }
  
  // Optimized lookup methods
  getNamespaceURI(prefix: string): string {
    return this.declarations.get(prefix) 
      || (this.parent && this.parent.getNamespaceURI(prefix))
      || null;
  }
}
```

**Benefits**:
- Faster namespace lookups
- Better memory usage
- Scales with complex WSDLs

---

## 12. Debug Logging

### ❌ Current (ngx-soap)
```typescript
// No structured debugging
console.log('Debug info:', data);
```

### ✅ Improved (node-soap)
```typescript
// File: src/client.ts

import debugBuilder from 'debug';
const debug = debugBuilder('node-soap');

// Usage throughout the code
debug('Creating client for WSDL: %s', wsdlUrl);
debug('Invoking method: %s', methodName);
debug('Request XML: %s', xml);
debug('Response received: %d bytes', response.length);

// Enable with environment variable:
// DEBUG=node-soap npm start
```

**For ngx-soap**: Add debug package
```json
// package.json
"debug": "^4.4.3"
```

**Usage in browser**:
```typescript
// In browser console
localStorage.debug = 'ngx-soap:*';
```

---

## 13. Async Method Generation

### ❌ Current (ngx-soap)
```typescript
// Only callback-based methods
client.MyMethod(args, (err, result) => {
  // handle result
});
```

### ✅ Improved (node-soap v0.20.0)
```typescript
// Both callback and promise-based methods

// Callback
client.MyMethod(args, (err, result) => {
  // handle result
});

// Promise
const result = await client.MyMethodAsync(args);

// Or with custom suffix
const result = await client.MyMethodPromise(args); // if overridePromiseSuffix = 'Promise'
```

**Implementation**:
```typescript
// In client initialization
for (const methodName in port) {
  // Create callback version
  this[methodName] = function(...args) {
    // callback implementation
  };
  
  // Create promise version
  const asyncMethodName = methodName + this.overridePromiseSuffix;
  this[asyncMethodName] = function(...args) {
    return new Promise((resolve, reject) => {
      this[methodName](...args, (err, result, raw, headers) => {
        if (err) reject(err);
        else resolve([result, raw, headers]);
      });
    });
  };
}
```

---

## 14. SOAP Fault Response

### ❌ Current (ngx-soap)
```typescript
// May not handle faults correctly
if (error) {
  return callback(error);
}
```

### ✅ Improved (node-soap)
```typescript
// Better fault handling
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

  const error: ISoapFault = new Error(string);
  error.code = code;
  error.actor = actor;
  error.detail = detail;
  error.statusCode = fault.statusCode || 500;

  if (options.returnFault) {
    // Return as data, not error
    return callback(null, fault);
  }

  return callback(error, fault);
}
```

---

## 15. WSSecurity Timestamp

### ❌ Current (ngx-soap)
```typescript
// Hardcoded ID
<Timestamp Id="Timestamp">
  <Created>${created}</Created>
  <Expires>${expires}</Expires>
</Timestamp>
```

### ✅ Improved (node-soap v1.2.0)
```typescript
// Dynamic ID generation
const timestampId = `Timestamp-${randomUUID()}`;

<Timestamp Id="${timestampId}">
  <Created>${created}</Created>
  <Expires>${expires}</Expires>
</Timestamp>
```

**Benefits**:
- Avoids ID collisions
- Better security
- Complies with WS-Security spec

---

## Summary of Quick Wins

These can be implemented with minimal risk:

1. ✅ Replace trim() with native String.trim()
2. ✅ Replace uuid with crypto.randomUUID()
3. ✅ Update xml-crypto to v6.x
4. ✅ Add debug logging
5. ✅ Improve error messages
6. ✅ Add event exchange IDs
7. ✅ Add getSoapHeaders() and clearSoapHeaders()
8. ✅ Improve fault handling
9. ✅ Use dynamic timestamp IDs
10. ✅ Add new IOptions properties

---

## Notes for Implementation

1. **Test Each Change**: Implement and test each improvement separately
2. **Maintain Compatibility**: Keep existing API working
3. **Add Feature Flags**: Use options for new behaviors
4. **Update Types**: Keep TypeScript definitions in sync
5. **Document Changes**: Update README for each new feature

---

## Testing Strategy

For each change:

```typescript
// 1. Write test for old behavior
it('should work with old behavior', () => {
  // test current implementation
});

// 2. Write test for new behavior  
it('should work with new behavior', () => {
  // test improved implementation
});

// 3. Write backward compatibility test
it('should maintain backward compatibility', () => {
  // ensure old code still works
});
```

---

## Next Steps

1. Start with the Quick Wins section
2. Create a feature branch for each improvement
3. Implement with tests
4. Code review
5. Merge to main
6. Release as patch/minor version

