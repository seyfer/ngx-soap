import { EventEmitter } from 'events';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface IXmlAttribute {
    name: string;
    value: string;
}

export interface IWsdlBaseOptions {
    /** Key for XML attributes in parsed objects (default: 'attributes') */
    attributesKey?: string;
    /** Key for element text values in parsed objects (default: '$value') */
    valueKey?: string;
    /** Key for raw XML in parsed objects (default: '$xml') */
    xmlKey?: string;
    /** Override root element namespace and attributes */
    overrideRootElement?: { namespace: string; xmlnsAttributes?: IXmlAttribute[]; };
    /** Namespaces to ignore during parsing */
    ignoredNamespaces?: boolean | string[] | { namespaces?: string[]; override?: boolean; };
    /** Ignore base namespaces during serialization */
    ignoreBaseNameSpaces?: boolean;
    /** Control XML escaping for special characters (default: true) */
    escapeXML?: boolean;
    /** Return SOAP Faults as data instead of throwing errors (default: false) */
    returnFault?: boolean;
    /** Treat xsi:nil as null instead of empty object (default: false) */
    handleNilAsNull?: boolean;
    /** Headers to include in WSDL HTTP requests */
    wsdl_headers?: { [key: string]: any };
    /** Options for WSDL HTTP requests */
    wsdl_options?: { [key: string]: any };
    /** Add namespace to array elements (default: false) */
    namespaceArrayElements?: boolean;
    
    /** Use self-closing tags for empty elements: <Tag /> instead of <Tag></Tag> (default: false) */
    useEmptyTag?: boolean;
    /** Preserve leading and trailing whitespace in text content (default: false) */
    preserveWhitespace?: boolean;
    /** Replace non-identifier characters in operation names with underscores (default: false) */
    normalizeNames?: boolean;
    /** Hide stack traces in error messages (default: false) */
    suppressStack?: boolean;
    /** Force schema xmlns usage even when not required (default: false) */
    forceUseSchemaXmlns?: boolean;
    /** Custom envelope key prefix (default: 'soap') */
    envelopeKey?: string;
    /** Override the suffix for promise-based methods (default: 'Async') */
    overridePromiseSuffix?: string;
}

export interface Definitions {
    descriptions: object;
    ignoredNamespaces: string[];
    messages: WsdlMessages;
    portTypes: WsdlPortTypes;
    bindings: WsdlBindings;
    services: WsdlServices;
    schemas: WsdlSchemas;
    valueKey: string;
    xmlKey: string;
    xmlns: WsdlXmlns;
    '$targetNamespace': string;
    '$name': string;
}


export interface WsdlSchemas {
    [prop: string]: WsdlSchema;
}
export interface WsdlSchema extends XsdTypeBase {
    children: any[];
    complexTypes?: WsdlElements;
    elements?: WsdlElements;
    includes: any[];
    name: string;
    nsName: string;
    prefix: string;
    types?: WsdlElements;
    xmlns: WsdlXmlns;
}
export interface WsdlElements {
    [prop: string]: XsdElement;
}
export type XsdElement = XsdElementType | XsdComplexType;

export interface WsdlXmlns {
    wsu?: string;
    wsp?: string;
    wsam?: string;
    soap?: string;
    tns?: string;
    xsd?: string;
    __tns__?: string;
    [prop: string]: string | void;
}

export interface XsdComplexType extends XsdTypeBase {
    children: XsdElement[] | void;
    name: string;
    nsName: string;
    prefix: string;
    '$name': string;
    [prop: string]: any;
}

export interface XsdElementType extends XsdTypeBase {
    children: XsdElement[] | void;
    name: string;
    nsName: string;
    prefix: string;
    targetNSAlias: string;
    targetNamespace: string;
    '$lookupType': string;
    '$lookupTypes': any[];
    '$name': string;
    '$type': string;
    [prop: string]: any;
}

export interface WsdlMessages {
    [prop: string]: WsdlMessage;
}
export interface WsdlMessage extends XsdTypeBase {
    element: XsdElement;
    parts: { [prop: string]: any };
    '$name': string;
}

export interface WsdlPortTypes {
    [prop: string]: WsdlPortType;
}
export interface WsdlPortType extends XsdTypeBase {
    methods: { [prop: string]: XsdElement }
}

export interface WsdlBindings {
    [prop: string]: WsdlBinding;
}
export interface WsdlBinding extends XsdTypeBase {
    methods: WsdlElements;
    style: string;
    transport: string;
    topElements: {[prop: string]: any};
}

export interface WsdlServices {
    [prop: string]: WsdlService;
}
export interface WsdlService extends XsdTypeBase {
    ports: {[prop: string]: any};
}

export interface XsdTypeBase {
    ignoredNamespaces: string[];
    valueKey: string;
    xmlKey: string;
    xmlns?: WsdlXmlns,
}

export interface IOptions extends IWsdlBaseOptions {
    disableCache?: boolean;
    /** Override the SOAP service endpoint address */
    endpoint?: string;
    /** Custom envelope key prefix (default: 'soap') */
    envelopeKey?: string;
    /** Angular HttpClient instance for HTTP requests */
    httpClient?: HttpClient;
    // request?: (options: any, callback?: (error: any, res: any, body: any) => void) => void;
    stream?: boolean;
    /** Force SOAP 1.2 headers instead of SOAP 1.1 */
    forceSoap12Headers?: boolean;
    /** Custom deserializer function */
    customDeserializer?: any;
    /** Exchange ID for request/response tracking (auto-generated if not provided) */
    exchangeId?: string;
    /** 
     * Select specific service when WSDL has multiple services
     * If not specified, defaults to first service found
     * @example { serviceName: 'MyService' }
     */
    serviceName?: string;
    /**
     * Select specific port when service has multiple ports
     * If not specified, defaults to first port found
     * @example { portName: 'MyServicePort' }
     */
    portName?: string;
    [key: string]: any;
}

export interface WSDL {
    constructor(definition: any, uri: string, options?: IOptions);
    ignoredNamespaces: string[];
    ignoreBaseNameSpaces: boolean;
    valueKey: string;
    xmlKey: string;
    xmlnsInEnvelope: string;
    onReady(callback: (err:Error) => void): void;
    processIncludes(callback: (err:Error) => void): void;
    describeServices(): { [k: string]: any };
    toXML(): string;
    xmlToObject(xml: any, callback?: (err:Error, result:any) => void): any;
    findSchemaObject(nsURI: string, qname: string): XsdElement | null | undefined;
    objectToDocumentXML(name: string, params: any, nsPrefix?: string, nsURI?: string, type?: string): any;
    objectToRpcXML(name: string, params: any, nsPrefix?: string, nsURI?: string, isParts?: any): string;
    isIgnoredNameSpace(ns: string): boolean;
    filterOutIgnoredNameSpace(ns: string): string;
    objectToXML(obj: any, name: string, nsPrefix?: any, nsURI?: string, isFirst?: boolean, xmlnsAttr?: any, schemaObject?: any, nsContext?: any): string;
    processAttributes(child: any, nsContext: any): string;
    findSchemaType(name: any, nsURI: any): any;
    findChildSchemaObject(parameterTypeObj: any, childName: any, backtrace?: any): any;
    uri: string;
    definitions: Definitions;
}

export interface Client extends EventEmitter {
    constructor(wsdl: WSDL, endpoint?: string, options?: IOptions);
    addBodyAttribute(bodyAttribute: any, name?: string, namespace?: string, xmlns?: string): void;
    addHttpHeader(name: string, value: any): void;
    addSoapHeader(soapHeader: any, name?: string, namespace?: any, xmlns?: string): number;
    changeSoapHeader(index: number, soapHeader: any, name?: string, namespace?: string, xmlns?: string): void;
    clearBodyAttributes(): void;
    clearHttpHeaders(): void;
    clearSoapHeaders(): void;
    describe(): any;
    getBodyAttributes(): any[];
    getHttpHeaders(): { [k:string]: string };
    getSoapHeaders(): string[];
    setEndpoint(endpoint: string): void;
    setSOAPAction(action: string): void;
    setSecurity(security: ISecurity): void;
    wsdl: WSDL;
    [method: string]: ISoapMethod | WSDL | Function;
    call(method: string, body: any, options?: any, extraHeaders?: any): Observable<ISoapMethodResponse>;
}

export interface ISoapMethod {
    (args: any, options?: any, extraHeaders?: any): Observable<ISoapMethodResponse>;
}

export interface ISoapMethodResponse {
    err: any,
    header: any,
    responseBody: string,
    xml: string;
    result: any;
}

export interface ISecurity {
    addOptions(options: any): void;
    toXML(): string;
}

export interface BasicAuthSecurity extends ISecurity {
    constructor(username: string, password: string, defaults?: any);
    addHeaders(headers: any): void;
    addOptions(options: any): void;
    toXML(): string;
}

export interface BearerSecurity extends ISecurity {
    constructor(token: string, defaults?: any);
    addHeaders(headers: any): void;
    addOptions(options: any): void;
    toXML(): string;
}

export interface WSSecurity extends ISecurity {
    constructor(username: string, password: string, options?: any);
    addOptions(options: any): void;
    toXML(): string;
}

export interface WSSecurityCert extends ISecurity {
    constructor(privatePEM: any, publicP12PEM: any, password: any);
    addOptions(options: any): void;
    toXML(): string;
}

export interface NTLMSecurity extends ISecurity {
    constructor(username: string, password: string, domain: string, workstation);
    addHeaders(headers: any): void;
    addOptions(options: any): void;
    toXML(): string;
}
