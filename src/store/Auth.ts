import { create } from 'zustand';
import { immer } from "zustand/middleware/immer";
import { persist } from 'zustand/middleware';

import { AppwriteException, ID, Models } from "appwrite";
import { account } from "@/models/client/config";

export interface UserPrefs {
    reputation: number
}

interface IAuthStore {
    session: Models.Session | null;
    jwt: string | null;
    user: Models.User<UserPrefs> | null;
    hydrated: boolean;

    setHydrated(): void;
    verifySession(): Promise<void>;
    
    login(
        email: string,
        password: string
    ): Promise<{
        success: boolean; 
        error?: AppwriteException | null
    }>
    
    createAccount(
        name: string,
        email: string,
        password: string
    ): Promise<{
        success: boolean; 
        error?: AppwriteException | null
    }>

    logout(): Promise<void>
}

export const useAuthStore = create<IAuthStore>()(
    persist(
        immer((set) => ({
            session: null, jwt: null, user: null, hydrated: false,
            
            setHydrated() { set({ hydrated: true }) },
            
            async verifySession() {
                try {
                    const session = await account.getSession("current");
                    set({ session });
                } catch (error) {
                    // Fail silently if no session exists
                }
            },    
            
            async login(email: string, password: string) {
                try {
                    // FIX #1: Captured the session into a variable!
                    const session = await account.createEmailPasswordSession(email, password);

                    const [user, { jwt }] = await Promise.all([
                        account.get<UserPrefs>(), 
                        account.createJWT()
                    ]);

                    if (!user.prefs?.reputation) {
                        await account.updatePrefs<UserPrefs>({
                            reputation: 0
                        });
                    }

                    // Now 'session' actually exists to be saved to state!
                    set({ session, user, jwt });
                    return { success: true };

                } catch (error) {
                    return { success: false, error: error instanceof AppwriteException ? error : null };
                }
            },

            async createAccount(name: string, email: string, password: string) {
                try {
                    // FIX #2: Added the 'await' keyword so it waits for Appwrite to respond!
                    await account.create(ID.unique(), email, password, name);
                    return { success: true };
                
                } catch (error) {
                    console.log("Registration Error:", error);
                    return { success: false, error: error instanceof AppwriteException ? error : null };
                }
            },
            
            async logout() {
                try {
                    await account.deleteSessions();
                    set({ session: null, jwt: null, user: null });
                } catch (error) {
                    console.log("Logout Error:", error);
                }
            }
        })),
        {
            name: "auth",
            onRehydrateStorage: () => (state, error) => {
                if (!error) state?.setHydrated();
            }
        }
    ) 
);