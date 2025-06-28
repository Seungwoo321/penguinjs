import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "./Button";
import { Globe } from "lucide-react";
export function LanguageToggle() {
    const router = useRouter();
    const pathname = usePathname();
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => {
        setMounted(true);
    }, []);
    if (!mounted) {
        return (_jsx(Button, { variant: "ghost", size: "icon", disabled: true, children: _jsx(Globe, { className: "h-5 w-5" }) }));
    }
    const currentLocale = pathname.split('/')[1];
    const isKorean = currentLocale === 'ko';
    const toggleLanguage = () => {
        const newLocale = isKorean ? 'en' : 'ko';
        const newPath = pathname.replace(`/${currentLocale}`, `/${newLocale}`);
        router.push(newPath);
    };
    return (_jsx(Button, { variant: "ghost", size: "icon", onClick: toggleLanguage, className: "hover:bg-penguin-50 dark:hover:bg-slate-800", title: isKorean ? "Switch to English" : "한국어로 변경", children: _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Globe, { className: "h-4 w-4 text-slate-700 dark:text-slate-300" }), _jsx("span", { className: "text-xs font-medium text-slate-700 dark:text-slate-300", children: isKorean ? 'EN' : 'KO' })] }) }));
}
//# sourceMappingURL=LanguageToggle.js.map