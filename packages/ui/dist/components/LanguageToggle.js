import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "./Button";
import { Globe, ChevronDown } from "lucide-react";
const languages = [
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'zh', name: '中文', flag: '🇨🇳' }
];
export function LanguageToggle() {
    const router = useRouter();
    const pathname = usePathname();
    const [mounted, setMounted] = React.useState(false);
    const [isOpen, setIsOpen] = React.useState(false);
    React.useEffect(() => {
        setMounted(true);
    }, []);
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            const target = event.target;
            if (!target.closest('[data-language-toggle]')) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [isOpen]);
    if (!mounted) {
        return (_jsx(Button, { variant: "ghost", size: "icon", disabled: true, children: _jsx(Globe, { className: "h-5 w-5" }) }));
    }
    const currentLocale = pathname.split('/')[1] || 'ko';
    const currentLanguage = languages.find(lang => lang.code === currentLocale) || languages[0];
    const changeLanguage = (newLocale) => {
        const newPath = pathname.replace(`/${currentLocale}`, `/${newLocale}`);
        router.push(newPath);
        setIsOpen(false);
    };
    return (_jsxs("div", { className: "relative", "data-language-toggle": true, children: [_jsxs(Button, { variant: "outline", size: "sm", onClick: () => setIsOpen(!isOpen), title: "Change Language", className: "text-foreground flex items-center gap-1.5", children: [_jsx("span", { className: "text-sm", children: currentLanguage.flag }), _jsx("span", { className: "text-xs font-semibold text-foreground", children: currentLanguage.code.toUpperCase() }), _jsx(ChevronDown, { className: "h-3 w-3 text-foreground" })] }), isOpen && (_jsx("div", { className: "absolute top-full right-0 mt-1 bg-background border border-input rounded-lg shadow-xl py-1 z-50 min-w-36", children: languages.map((language) => (_jsxs("button", { onClick: () => changeLanguage(language.code), className: `w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground flex items-center gap-2 transition-colors ${currentLocale === language.code
                        ? 'bg-accent text-accent-foreground font-semibold'
                        : ''}`, children: [_jsx("span", { className: "text-base", children: language.flag }), _jsx("span", { children: language.name })] }, language.code))) }))] }));
}
//# sourceMappingURL=LanguageToggle.js.map