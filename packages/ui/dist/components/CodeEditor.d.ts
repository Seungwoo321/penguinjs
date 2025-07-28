import * as React from "react";
interface CodeEditorProps {
    value: string;
    onChange: (value: string) => void;
    language?: string;
    placeholder?: string;
    className?: string;
    readOnly?: boolean;
}
export declare const CodeEditor: React.ForwardRefExoticComponent<CodeEditorProps & React.RefAttributes<HTMLDivElement>>;
export {};
//# sourceMappingURL=CodeEditor.d.ts.map