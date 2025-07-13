// src/contexts/AuthContext.tsx
  import { onAuthStateChanged } from "firebase/auth";
//  import type { User as FbUser } from "firebase/auth";
  import { auth } from "../lib/firebase";
  import { createContext, useEffect, useState } from "react";
  import type { ReactNode } from "react";
  
  type AuthState = "loading" | "signedOut" | "signedIn";
  
  export interface AppUser {
    uid: string;
    email: string | null;
    role: "viewer" | "editor" | "admin";
    groups: string[];
  }

  interface ContextValue {
    state: AuthState;
    user: AppUser | null;
  }
  
  export const AuthCtx = createContext<ContextValue>({ state: "loading", user: null });
  
  export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [ctx, setCtx] = useState<ContextValue>({ state: "loading", user: null });
  
    useEffect(() => {
        return onAuthStateChanged(auth, async (fb) => {
          if (!fb) {
            setCtx({ state: "signedOut", user: null });
            return;
          }
          const token = await fb.getIdTokenResult();
          setCtx({
            state: "signedIn",
            user: {
              uid: fb.uid,
              email: fb.email,
              role: (token.claims.role as any) ?? "viewer",
              groups: (token.claims.groups as any) ?? [],
            },
          });
        });
      }, []);
    
      return <AuthCtx.Provider value={ctx}>{children}</AuthCtx.Provider>;
    };
  