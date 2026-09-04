import { Client, Account } from 'appwrite';

const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID || '';

export const client = new Client();
client.setEndpoint(endpoint).setProject(projectId);

export const account = new Account(client);
