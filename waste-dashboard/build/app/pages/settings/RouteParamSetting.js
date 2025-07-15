import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRouteSettings } from "../../hooks/useRouteSettings";
import { Button } from "../../components/ui/button";
import { useState } from "react";
export default function RouteParamSetting() {
    const { settings, save, loading } = useRouteSettings();
    const [addr, setAddr] = useState(settings.startAddress);
    if (loading)
        return _jsx("p", { children: "Loading\u2026" });
    return (_jsxs("div", { className: "space-y-4 max-w-md", children: [_jsx("h2", { className: "text-xl font-bold", children: "\u30EB\u30FC\u30C8\u751F\u6210\u30D1\u30E9\u30E1\u30FC\u30BF" }), _jsxs("label", { className: "block text-sm font-medium", children: ["\u30B9\u30BF\u30FC\u30C8\u5730\u70B9\uFF08\u4F4F\u6240\uFF09", _jsx("input", { value: addr, onChange: (e) => setAddr(e.target.value), className: "mt-1 w-full border rounded px-2 py-1" })] }), _jsx(Button, { onClick: () => save({ startAddress: addr }), children: "\u4FDD\u5B58" })] }));
}
