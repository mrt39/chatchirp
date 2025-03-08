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