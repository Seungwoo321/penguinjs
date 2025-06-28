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
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView } from '@codemirror/view';
import { useTheme } from 'next-themes';
const lightTheme = EditorView.theme({
    '&': {
        color: '#1b2a3a', // penguin-900
        backgroundColor: '#ffffff', // 순백색
        fontSize: '14px',
        fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace',
    },
    '.cm-content': {
        padding: '16px',
        fontSize: '14px',
        lineHeight: '1.6',
        fontFamily: 'inherit',
        caretColor: '#1b2a3a',
        minHeight: '200px',
    },
    '.cm-focused': {
        outline: 'none',
    },
    '.cm-editor': {
        borderRadius: '0 0 8px 8px',
        border: '1px solid #d6e6f0', // penguin-200
        borderTop: 'none',
    },
    '.cm-scroller': {
        fontFamily: 'inherit',
    },
    '.cm-gutters': {
        backgroundColor: '#f3f4f6', // gray-100
        color: '#6b7280', // gray-500
        border: 'none',
        borderRight: '1px solid #e5e7eb', // gray-200
    },
    '.cm-activeLineGutter': {
        backgroundColor: '#e5e7eb', // gray-200
        color: '#374151', // gray-700
    },
    '.cm-lineNumbers': {
        color: '#9ca3af', // gray-400
    },
    '.cm-activeLine': {
        backgroundColor: 'rgba(237, 243, 248, 0.5)',
    },
    '.cm-selectionBackground': {
        backgroundColor: '#4a7691', // penguin-600
        opacity: '0.2',
    },
    '&.cm-focused .cm-selectionBackground': {
        backgroundColor: '#4a7691',
        opacity: '0.3',
    }
}, { dark: false });
export const CodeEditor = React.forwardRef((_a, ref) => {
    var { value, onChange, language = "javascript", placeholder = "// 코드를 입력하세요...", className, readOnly = false } = _a, props = __rest(_a, ["value", "onChange", "language", "placeholder", "className", "readOnly"]);
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    return (_jsxs("div", Object.assign({ ref: ref, className: cn("relative h-full flex flex-col", className) }, props, { children: [_jsxs("div", { className: cn("h-10 rounded-t-lg flex items-center justify-between px-4 border-b", isDark
                    ? "bg-slate-800 border-slate-700"
                    : "bg-[#edf3f8] border-[#d6e6f0]"), children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-3 h-3 rounded-full bg-red-500" }), _jsx("div", { className: "w-3 h-3 rounded-full bg-yellow-500" }), _jsx("div", { className: "w-3 h-3 rounded-full bg-green-500" })] }), language && (_jsx("div", { className: cn("text-xs opacity-70 font-medium", isDark ? "text-slate-200" : "text-[#3e6280]"), children: language.toUpperCase() }))] }), _jsx("div", { className: "flex-1 overflow-hidden", children: _jsx(CodeMirror, { value: value, onChange: onChange, placeholder: placeholder, editable: !readOnly, extensions: [
                        javascript(),
                        EditorView.lineWrapping,
                        EditorView.theme({
                            '&': {
                                height: '100%',
                            },
                            '.cm-editor': {
                                height: '100%',
                            },
                            '.cm-scroller': {
                                height: '100%',
                            }
                        })
                    ], theme: isDark ? oneDark : lightTheme, className: "h-full", basicSetup: {
                        lineNumbers: true,
                        foldGutter: true,
                        dropCursor: true,
                        allowMultipleSelections: false,
                        indentOnInput: true,
                        bracketMatching: true,
                        closeBrackets: true,
                        autocompletion: true,
                        highlightSelectionMatches: false,
                    } }) })] })));
});
CodeEditor.displayName = "CodeEditor";
//# sourceMappingURL=CodeEditor.js.map