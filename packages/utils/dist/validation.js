/**
 * 검증 관련 유틸리티 함수들
 */
import { z } from 'zod';
export function isEmail(email) {
    const emailSchema = z.string().email();
    return emailSchema.safeParse(email).success;
}
export function isUrl(url) {
    const urlSchema = z.string().url();
    return urlSchema.safeParse(url).success;
}
export function isValidJavaScript(code) {
    try {
        new Function(code);
        return true;
    }
    catch (_a) {
        return false;
    }
}
export function sanitizeJavaScript(code) {
    // 위험한 패턴들을 제거하거나 치환
    const dangerousPatterns = [
        /eval\s*\(/gi,
        /Function\s*\(/gi,
        /setTimeout\s*\(/gi,
        /setInterval\s*\(/gi,
        /XMLHttpRequest/gi,
        /fetch\s*\(/gi,
        /import\s*\(/gi,
        /require\s*\(/gi,
        /process\./gi,
        /__dirname/gi,
        /__filename/gi,
    ];
    let sanitizedCode = code;
    dangerousPatterns.forEach(pattern => {
        sanitizedCode = sanitizedCode.replace(pattern, '/* BLOCKED */');
    });
    return sanitizedCode;
}
export function isValidGameStageCode(code, allowedAPIs = []) {
    // 기본적으로 허용되는 JavaScript 기능들
    const defaultAllowedAPIs = [
        'console.log',
        'Math.',
        'Array.',
        'Object.',
        'String.',
        'Number.',
        'Boolean.',
        'Date.',
        'JSON.',
    ];
    const allAllowedAPIs = [...defaultAllowedAPIs, ...allowedAPIs];
    // 허용되지 않은 API 사용 검사
    const forbiddenPatterns = [
        /document\./gi,
        /window\./gi,
        /location\./gi,
        /history\./gi,
        /navigator\./gi,
        /localStorage/gi,
        /sessionStorage/gi,
    ];
    for (const pattern of forbiddenPatterns) {
        if (pattern.test(code)) {
            return false;
        }
    }
    return isValidJavaScript(code);
}
//# sourceMappingURL=validation.js.map