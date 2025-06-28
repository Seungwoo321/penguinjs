import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { useTheme } from "next-themes";
import { Button } from "./Button";
import { Sun, Moon } from "lucide-react";
export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => {
        setMounted(true);
    }, []);
    if (!mounted) {
        return (_jsx(Button, { variant: "ghost", size: "icon", disabled: true, children: _jsx(Sun, { className: "h-5 w-5" }) }));
    }
    return (_jsx(Button, { variant: "ghost", size: "icon", onClick: () => setTheme(theme === "dark" ? "light" : "dark"), className: "hover:bg-penguin-50 dark:hover:bg-slate-800", children: theme === "dark" ? (_jsx(Sun, { className: "h-5 w-5 text-yellow-500" })) : (_jsx(Moon, { className: "h-5 w-5 text-slate-700" })) }));
}
//# sourceMappingURL=ThemeToggle.js.map