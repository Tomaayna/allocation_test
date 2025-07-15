import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { useTheme } from "../../contexts/ThemeContext";
import { Button } from "../../components/ui/button";
const ACCENTS = ["blue", "green", "purple", "rose"];
export default function ThemeSettings() {
    const { mode, accent, setMode, setAccent } = useTheme();
    return (_jsxs("div", { className: "max-w-xl mx-auto space-y-8 p-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "\u8868\u793A\u30E2\u30FC\u30C9" }) }), _jsx(CardContent, { className: "flex gap-3", children: ["light", "dark"].map((m) => (_jsx(Button, { variant: mode === m ? "default" : "secondary", onClick: () => setMode(m), className: "capitalize", children: m }, m))) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "\u30A2\u30AF\u30BB\u30F3\u30C8\u30AB\u30E9\u30FC" }) }), _jsx(CardContent, { className: "flex gap-3 flex-wrap", children: ACCENTS.map((a) => (_jsx("button", { onClick: () => setAccent(a), className: `w-10 h-10 rounded-full ring-2 ${accent === a ? "ring-accent" : "ring-transparent"}`, style: { backgroundColor: `var(--accent, ${a})` }, "aria-label": a }, a))) })] })] }));
}
