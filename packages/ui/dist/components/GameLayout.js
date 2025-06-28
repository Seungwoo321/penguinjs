var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import { cn } from "../lib/utils";
import { Button } from "./Button";
import { Card, CardContent, CardHeader, CardTitle } from "./Card";
import { ThemeToggle } from "./ThemeToggle";
import { ArrowLeft, Home, HelpCircle } from "lucide-react";
export const GameLayout = React.forwardRef((_a, ref) => {
    var { children, title, currentStage, totalStages, onHome, onPrevious, onHelp, className } = _a, props = __rest(_a, ["children", "title", "currentStage", "totalStages", "onHome", "onPrevious", "onHelp", "className"]);
    return (_jsxs("div", Object.assign({ ref: ref, className: cn("min-h-screen bg-gradient-to-br from-penguin-50 to-penguin-100 dark:from-slate-900 dark:to-slate-800", className) }, props, { children: [_jsx("header", { className: "bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm shadow-lg border-b border-penguin-100 dark:border-slate-800", children: _jsxs("div", { className: "container mx-auto px-4 py-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-4", children: [onPrevious && (_jsx(Button, { variant: "ghost", size: "icon", onClick: onPrevious, className: "hover:bg-penguin-50 dark:hover:bg-slate-800", children: _jsx(ArrowLeft, { className: "h-5 w-5 text-penguin-700 dark:text-slate-300" }) })), _jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-penguin-900 dark:text-slate-100 flex items-center gap-2", children: title }), _jsxs("p", { className: "text-sm font-medium text-penguin-700 dark:text-slate-300", children: ["Stage ", currentStage, " of ", totalStages] })] })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(ThemeToggle, {}), onHelp && (_jsx(Button, { variant: "outline", size: "icon", onClick: onHelp, className: "border-penguin-200 hover:bg-penguin-50 dark:border-slate-700 dark:hover:bg-slate-800", children: _jsx(HelpCircle, { className: "h-5 w-5 text-penguin-600 dark:text-slate-400" }) })), onHome && (_jsx(Button, { variant: "outline", size: "icon", onClick: onHome, className: "border-penguin-200 hover:bg-penguin-50 dark:border-slate-700 dark:hover:bg-slate-800", children: _jsx(Home, { className: "h-5 w-5 text-penguin-600 dark:text-slate-400" }) }))] })] }), _jsx("div", { className: "mt-4", children: _jsx("div", { className: "w-full bg-penguin-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden", children: _jsx("div", { className: "bg-gradient-to-r from-penguin-400 to-penguin-600 dark:from-penguin-500 dark:to-penguin-400 h-3 rounded-full transition-all duration-500 ease-out", style: { width: `${(currentStage / totalStages) * 100}%` } }) }) })] }) }), _jsx("main", { className: "container mx-auto px-4 py-8", children: children })] })));
});
GameLayout.displayName = "GameLayout";
export const GamePanel = React.forwardRef((_a, ref) => {
    var { children, title, className } = _a, props = __rest(_a, ["children", "title", "className"]);
    return (_jsxs(Card, Object.assign({ ref: ref, className: cn("h-full", className) }, props, { children: [title && (_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg", children: title }) })), _jsx(CardContent, { className: "flex-1", children: children })] })));
});
GamePanel.displayName = "GamePanel";
//# sourceMappingURL=GameLayout.js.map