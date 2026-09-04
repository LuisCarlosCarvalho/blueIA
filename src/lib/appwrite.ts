import { Client, Account, Databases } from "appwrite";

const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT || "https://fra.cloud.appwrite.io/v1";
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID || "6a9acdfc001df5a3acba";

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId);

const account = new Account(client);
const databases = new Databases(client);

// Função de verificação automática que executa o ping no backend Appwrite
if (typeof (client as any).ping === "function") {
  (client as any).ping().catch((err: any) => {
    console.info("Appwrite ping status:", err?.message || err);
  });
}

export { client, account, databases };
