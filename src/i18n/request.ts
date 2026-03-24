import { getRequestConfig } from 'next-intl/server'

const SUPPORTED_LOCALES = ['en', 'pt', 'es', 'fr', 'ja', 'zh']

export default getRequestConfig(async ({ locale }) => {
  const resolved = SUPPORTED_LOCALES.includes(locale ?? '') ? locale : 'en'
  return {
    locale: resolved!,
    messages: (await import(`../../messages/${resolved}.json`)).default,
  }
})
