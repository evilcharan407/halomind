import Config from "react-native-config";

// IMPORTANT: You must create a project in the Google Cloud Console,
// enable the Google Drive API, and generate an API Key and an OAuth 2.0 Client ID.
// https://console.cloud.google.com/
// Then, you need to set these as environment variables for your project.

export const GOOGLE_API_KEY = Config.GOOGLE_API_KEY;
export const GOOGLE_CLIENT_ID = Config.GOOGLE_CLIENT_ID;

// The scope for the Drive API to access only the app's own data folder.
export const DRIVE_SCOPES = 'https://www.googleapis.com/auth/drive.appdata';

// The name of the file to store the app data in Google Drive.
export const DRIVE_FILENAME = 'halomind_data.json';
