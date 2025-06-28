/**
 * 포맷팅 관련 유틸리티 함수들
 */

export function formatNumber(num: number, locale: string = 'ko-KR'): string {
  return new Intl.NumberFormat(locale).format(num)
}

export function formatPercent(value: number, locale: string = 'ko-KR'): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value)
}

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

export function formatScore(score: number): string {
  if (score >= 1000000) {
    return (score / 1000000).toFixed(1) + 'M'
  } else if (score >= 1000) {
    return (score / 1000).toFixed(1) + 'K'
  } else {
    return score.toString()
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}