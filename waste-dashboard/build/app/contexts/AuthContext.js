import { jsx as _jsx } from "react/jsx-runtime";
// src/contexts/AuthContext.tsx
import { onAuthStateChanged } from "firebase/auth";
//  import type { User as FbUser } from "firebase/auth";
import { auth } from "../lib/firebase";
import { createContext, useEffect, useState } from "react";
export const AuthCtx = createContext({ state: "loading", user: null });
export const AuthProvider = ({ children }) => {
    const [ctx, setCtx] = useState({ state: "loading", user: null });
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
                    role: token.claims.role ?? "viewer",
                    groups: token.claims.groups ?? [],
                },
            });
        });
    }, []);
    return _jsx(AuthCtx.Provider, { value: ctx, children: children });
};
