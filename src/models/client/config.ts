import { Client, Account, Avatars, Databases, Storage } from "appwrite";

const client = new Client();

client
    .setEndpoint(String(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT))
    .setProject(String(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID));

const databases = new Databases(client);
const account = new Account(client);
const avatars = new Avatars(client);
const storage = new Storage(client);

export { client, databases, account, avatars, storage };