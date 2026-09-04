import { Client, Account, Databases } from 'appwrite';

const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID || '6a9acdfc001df5a3acba';

export const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId);

export const account = new Account(client);
export const databases = new Databases(client);

// Ping de inicialização para verificar conectividade com o backend Appwrite
if (typeof (client as any).ping === 'function') {
  (client as any).ping().catch((err: any) => {
    console.warn('Appwrite ping status:', err?.message || err);
  });
}
