//utilities for text processing and formatting
import { clean as profanityClean } from 'profanity-cleaner';

//clean text content with profanity filter
export async function cleanTextContent(text, options = { keepFirstAndLastChar: true, placeholder: '#' }) {
    if (!text) return '';
    return await profanityClean(text, options);
}

//format message content with emojis, links, etc
export function formatMessageContent(content) {
    //simple implementation - could be expanded with emoji parsing, link detection, etc
    return content;
}

//sanitize message text - simple but effective approach that avoids HTML encoding issues
//this function handles whitespace and removes potentially harmful content
export function sanitizeMessage(message) {
    //handle null/undefined inputs
    if (message === null || message === undefined) {
        return null;
    }
    
    //convert to string explicitly to handle non-string inputs
    const stringMessage = String(message);
    
    //step 0: decode any HTML entities (like &nbsp;) to their character equivalents
    //this prevents HTML entities from appearing in the UI
    let sanitized = stringMessage.replace(/&nbsp;/g, ' ');
    
    //step 1: trim leading and trailing whitespace
    //this removes spaces before and after the content
    sanitized = sanitized.trim();
    
    //step 2: if the message is empty after trimming, return null
    //this prevents sending empty messages or messages with only whitespace
    if (sanitized === '') {
        return null;
    }
    
    //step 3: normalize multiple spaces to single spaces
    //this preserves spacing between words but removes excessive whitespace
    sanitized = sanitized.replace(/\s+/g, ' ');
    
    //step 4: basic XSS protection - remove script tags and other dangerous HTML
    //instead of encoding HTML entities (which causes display issues),
    sanitized = sanitized
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<\/?\s*[a-zA-Z0-9]+(?:\s+[a-zA-Z0-9]+(?:\s*=\s*(?:"[^"]*"|'[^']*'))?)*\s*\/?>/g, '');
    
    //return the sanitized message
    return sanitized;
}

//decode HTML entities in text - useful for cleaning display text that already contains entities
//the problem solved here is when the message last sent has leading or trailing whitespaces (like " fish" and "fish " or just consists of whitespaces,
//the lastMsg tends to show the "nbsp" entity instead of whitespace, thus showing unintended html display. 
export function decodeHtmlEntities(text) {
    if (!text) return '';
    
    //create a temporary element to leverage the browser's native entity decoding
    const textArea = document.createElement('textarea');
    textArea.innerHTML = text;
    const decoded = textArea.value;
    
    return decoded;
}