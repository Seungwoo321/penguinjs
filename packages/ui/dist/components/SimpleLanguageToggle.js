import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "./Button";
import { Globe, ChevronDown } from "lucide-react";
const languages = [
    { code: 'ko', name: '한국어', shortName: 'KO', flag: '🇰🇷' },
    { code: 'en', name: 'English', shortName: 'EN', flag: '🇺🇸' },
    { code: 'ja', name: '日本語', shortName: 'JP', flag: '🇯🇵' },
    { code: 'zh', name: '中文', shortName: 'CN', flag: '🇨🇳' }
];
export function SimpleLanguageToggle({ variant = 'cycle', showIcon = true, className = '' }) {
    const router = useRouter();
    const pathname = usePathname();
    const [mounted, setMounted] = React.useState(false);
    const [isOpen, setIsOpen] = React.useState(false);
    const [buttonRect, setButtonRect] = React.useState(null);
    const buttonRef = React.useRef(null);
    React.useEffect(() => {
        setMounted(true);
    }, []);
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            const target = event.target;
            if (!target.closest('[data-language-toggle-simple]')) {
                setIsOpen(false);
            }
        };
        if (isOpen && variant === 'dropdown') {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [isOpen, variant]);
    const updateButtonRect = React.useCallback(() => {
        if (buttonRef.current) {
            setButtonRect(buttonRef.current.getBoundingClientRect());
        }
    }, []);
    if (!mounted) {
        return (_jsx(Button, { variant: "outline", size: "sm", disabled: true, children: _jsx(Globe, { className: "h-4 w-4" }) }));
    }
    const currentLocale = pathname.split('/')[1] || 'ko';
    const currentLanguage = languages.find(lang => lang.code === currentLocale) || languages[0];
    const currentIndex = languages.findIndex(lang => lang.code === currentLocale);
    const changeLanguage = (newLocale) => {
        const newPath = pathname.replace(`/${currentLocale}`, `/${newLocale}`);
        router.push(newPath);
    };
    const cycleLanguage = () => {
        const nextIndex = (currentIndex + 1) % languages.length;
        changeLanguage(languages[nextIndex].code);
    };
    // Variant 1: 아이콘 + 텍스트 (현재 게임화면 스타일)
    if (variant === 'icon-text') {
        return (_jsxs(Button, { variant: "outline", size: "sm", onClick: cycleLanguage, className: className, children: [showIcon && _jsx(Globe, { className: "h-4 w-4 mr-1" }), currentLanguage.shortName] }));
    }
    // Variant 2: 국기만 표시 (컴팩트)
    if (variant === 'flag-only') {
        return (_jsx(Button, { variant: "outline", size: "sm", onClick: cycleLanguage, className: className, title: currentLanguage.name, children: _jsx("span", { className: "text-base", children: currentLanguage.flag }) }));
    }
    // Variant 3: 순환 버튼 (국기 + 짧은 텍스트)
    if (variant === 'cycle') {
        return (_jsxs(Button, { variant: "outline", size: "sm", onClick: cycleLanguage, className: `flex items-center gap-1.5 ${className}`, title: `Change language (${languages[(currentIndex + 1) % languages.length].name})`, children: [_jsx("span", { className: "text-sm", children: currentLanguage.flag }), _jsx("span", { className: "text-xs font-semibold", children: currentLanguage.shortName })] }));
    }
    // Variant 4: 드롭다운 (4개 언어 선택)
    if (variant === 'dropdown') {
        return (_jsxs("div", { className: "relative inline-block text-left", "data-language-toggle-simple": true, style: { zIndex: 999 }, children: [_jsxs(Button, { variant: "outline", size: "sm", onClick: () => setIsOpen(!isOpen), className: `flex items-center gap-1.5 min-w-[70px] ${className}`, children: [_jsx("span", { className: "text-sm", children: currentLanguage.flag }), _jsx("span", { className: "text-xs font-semibold", children: currentLanguage.shortName }), _jsx(ChevronDown, { className: `h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}` })] }), isOpen && (_jsx("div", { className: "absolute right-0 top-full mt-1 min-w-[120px] w-max bg-background border border-input rounded-lg shadow-xl overflow-hidden", style: { zIndex: 9999 }, children: _jsx("div", { className: "py-1", children: languages.map((language) => (_jsxs("button", { onClick: () => {
                                changeLanguage(language.code);
                                setIsOpen(false);
                            }, className: `w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors text-left hover:bg-accent hover:text-accent-foreground
                    ${currentLocale === language.code
                                ? 'bg-accent text-accent-foreground font-medium'
                                : 'text-foreground'}`, children: [_jsx("span", { className: "text-base", children: language.flag }), _jsx("span", { className: "text-sm font-medium", children: language.shortName }), _jsx("span", { className: "text-xs text-muted-foreground", children: language.name })] }, language.code))) }) }))] }));
    }
    return null;
}
//# sourceMappingURL=SimpleLanguageToggle.js.map