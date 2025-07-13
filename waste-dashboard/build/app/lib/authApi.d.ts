export declare const loginWithEmail: (mail: string, pass: string) => Promise<import("@firebase/auth").UserCredential>;
export declare const loginWithGoogle: () => Promise<import("@firebase/auth").UserCredential>;
export declare const logout: () => Promise<void>;
