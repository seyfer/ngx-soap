/**
 * Test helpers and utilities for SOAP security testing
 */

/**
 * Parse XML string to check if it contains expected elements
 */
export function parseXmlString(xml: string): { [key: string]: any } {
    const result: { [key: string]: any } = {};
    
    // Extract namespaces
    const nsMatches = xml.match(/xmlns:(\w+)="([^"]+)"/g);
    if (nsMatches) {
        result.namespaces = {};
        nsMatches.forEach(match => {
            const [, prefix, uri] = match.match(/xmlns:(\w+)="([^"]+)"/) || [];
            if (prefix && uri) {
                result.namespaces[prefix] = uri;
            }
        });
    }
    
    return result;
}

/**
 * Check if XML contains a specific element
 */
export function xmlContainsElement(xml: string, elementName: string): boolean {
    const openTag = new RegExp(`<${elementName}[\\s>]`);
    const closeTag = new RegExp(`</${elementName}>`);
    return openTag.test(xml) || closeTag.test(xml);
}

/**
 * Extract element content from XML
 */
export function extractElementContent(xml: string, elementName: string): string | null {
    const regex = new RegExp(`<${elementName}[^>]*>([^<]+)</${elementName}>`);
    const match = xml.match(regex);
    return match ? match[1] : null;
}

/**
 * Extract attribute value from XML element
 */
export function extractAttribute(xml: string, elementName: string, attributeName: string): string | null {
    const regex = new RegExp(`<${elementName}[^>]*${attributeName}="([^"]+)"`);
    const match = xml.match(regex);
    return match ? match[1] : null;
}

/**
 * Check if XML is well-formed (basic check)
 */
export function isWellFormedXml(xml: string): boolean {
    // Check for basic XML structure
    const openTags = xml.match(/<[^\/][^>]*>/g) || [];
    const closeTags = xml.match(/<\/[^>]+>/g) || [];
    
    // Rough check: should have some tags
    return openTags.length > 0 && closeTags.length > 0;
}

/**
 * Decode Base64 string
 */
export function decodeBase64(str: string): string {
    return Buffer.from(str, 'base64').toString('utf-8');
}

// Fixture loading helper
export function loadFixture(filename: string): string {
    const fs = require('fs');
    const path = require('path');
    const fixturesDir = path.join(__dirname, '../fixtures');
    const filePath = path.join(fixturesDir, filename);
    return fs.readFileSync(filePath, 'utf8');
}

/**
 * Check if string is valid Base64
 */
export function isBase64(str: string): boolean {
    try {
        return Buffer.from(str, 'base64').toString('base64') === str;
    } catch {
        return false;
    }
}

