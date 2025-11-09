
import { Alert } from 'react-native';

// A simple regex to strip HTML tags. This is not a robust solution for all cases.
const stripHtmlTags = (html: string): string => {
    return html.replace(/<[^>]*>?/gm, '');
};

export const extractTextFromUrl = async (url: string): Promise<string | null> => {
    try {
        const response = await fetch(url);
        const html = await response.text();
        const text = stripHtmlTags(html);
        return text;
    } catch (error) {
        console.error('Failed to extract text from URL:', error);
        Alert.alert('Error', 'Failed to fetch or process the URL. Please make sure it is a valid and accessible web page.');
        return null;
    }
};
