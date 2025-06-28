import { getRequestConfig } from 'next-intl/server'

export default getRequestConfig(async ({ locale }) => {
  // locale이 없으면 기본값 사용
  const finalLocale = locale || 'ko'
  
  return {
    locale: finalLocale,
    messages: (await import(`../messages/${finalLocale}.json`)).default
  }
})