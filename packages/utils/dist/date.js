/**
 * 날짜 관련 유틸리티 함수들
 */
export function formatDate(date, locale = 'ko-KR') {
    return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(date);
}
export function formatTime(date, locale = 'ko-KR') {
    return new Intl.DateTimeFormat(locale, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    }).format(date);
}
export function getRelativeTime(date, locale = 'ko-KR') {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    if (diffInSeconds < 60) {
        return formatter.format(-diffInSeconds, 'second');
    }
    else if (diffInSeconds < 3600) {
        return formatter.format(-Math.floor(diffInSeconds / 60), 'minute');
    }
    else if (diffInSeconds < 86400) {
        return formatter.format(-Math.floor(diffInSeconds / 3600), 'hour');
    }
    else {
        return formatter.format(-Math.floor(diffInSeconds / 86400), 'day');
    }
}
export function formatDuration(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000) % 60;
    const minutes = Math.floor(milliseconds / (1000 * 60)) % 60;
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    else {
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}
//# sourceMappingURL=date.js.map