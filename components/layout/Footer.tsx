'use client'

import Link from 'next/link'
import { useIntl } from '@/components/IntlProvider'
import enMessages from '@/messages/en.json'

export default function Footer() {
  // Default SSR fallback using English translations
  let t = (key: string): string => {
    const keys = key.split('.')
    let value: any = enMessages
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        return key
      }
    }
    
    return typeof value === 'string' ? value : key
  }

  try {
    const intlContext = useIntl()
    t = intlContext.t
  } catch (error) {
    // During SSR, use English fallback defined above
  }

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-2xl">🏳️‍🌈</span>
              <span className="text-lg font-bold">Study With Pride</span>
            </div>
            <p className="text-gray-400 text-sm">
              {t('footer.tagline')}
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">{t('footer.resources')}</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/safety" className="hover:text-white transition">{t('footer.safetyInfo')}</Link></li>
              <li><Link href="/visa" className="hover:text-white transition">{t('footer.visaReqs')}</Link></li>
              <li><Link href="/cost-calculator" className="hover:text-white transition">{t('footer.budgetCalc')}</Link></li>
              <li><Link href="/partners" className="hover:text-white transition">{t('footer.partnerSchools')}</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">{t('footer.about')}</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/about" className="hover:text-white transition">{t('footer.ourMission')}</Link></li>
              <li><Link href="/testimonials" className="hover:text-white transition">{t('footer.studentStories')}</Link></li>
              <li><Link href="/contact" className="hover:text-white transition">{t('footer.contactUs')}</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  )
}
