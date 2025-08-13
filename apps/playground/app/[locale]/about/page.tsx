'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { ThemeToggle, LanguageToggle } from '@penguinjs/ui'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Home, ArrowLeft } from 'lucide-react'

export default function AboutPage() {
  const t = useTranslations('AboutPage')
  const pathname = usePathname()
  const currentLocale = pathname.split('/')[1] || 'ko'

  return (
    <main className="min-h-screen bg-[rgb(var(--surface-primary))]">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 bg-[rgb(var(--surface-primary))]/80 backdrop-blur-md border-b border-[rgb(var(--border-primary))]">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href={`/${currentLocale}`}
              className="flex items-center gap-2 text-[rgb(var(--text-primary))] hover:text-[rgb(var(--primary))] transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">{t('backToHome')}</span>
            </Link>
            <span className="text-[rgb(var(--text-tertiary))]">•</span>
            <h1 className="text-xl font-bold text-[rgb(var(--text-primary))]">{t('title')}</h1>
          </div>
          <div className="flex items-center gap-2 bg-[rgb(var(--surface-elevated))] rounded-lg p-1 shadow-lg">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* 인트로 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-3 mb-6">
            <span className="text-4xl">🐧</span>
            <h1 className="text-4xl md:text-5xl font-bold text-[rgb(var(--text-primary))]">
              PenguinJS
            </h1>
          </div>
          <p className="text-xl text-[rgb(var(--text-secondary))] max-w-2xl mx-auto leading-relaxed">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* 스토리 섹션들 */}
        <div className="space-y-16">
          {/* 영감의 시작 */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            <div>
              <h2 className="text-3xl font-bold text-[rgb(var(--text-primary))] mb-6 flex items-center gap-3">
                🎯 <span>{t('inspiration.title')}</span>
              </h2>
              <div className="space-y-4 text-[rgb(var(--text-secondary))] leading-relaxed">
                <p>
                  {t('inspiration.content1').split('FlexboxFroggy')[0]}
                  <strong className="text-[rgb(var(--text-primary))]">FlexboxFroggy</strong>
                  {t('inspiration.content1').split('FlexboxFroggy')[1]}
                </p>
                <p>
                  {t('inspiration.content2').split('완전히 새로운 도전')[0]}
                  <strong className="text-[rgb(var(--text-primary))]">{t('inspiration.content2').includes('완전히 새로운 도전') ? '완전히 새로운 도전' : 'completely new challenge'}</strong>
                  {t('inspiration.content2').split('완전히 새로운 도전')[1] || t('inspiration.content2').split('completely new challenge')[1]}
                </p>
                <p>
                  {t('inspiration.content3')}
                </p>
              </div>
            </div>
            <div className="bg-[rgb(var(--surface-elevated))] rounded-2xl p-8 shadow-lg">
              <div className="text-center">
                <div className="text-6xl mb-4">🐸</div>
                <h3 className="text-xl font-semibold text-[rgb(var(--text-primary))] mb-3">
                  {t('inspiration.flexboxInspiration')}
                </h3>
                <p className="text-sm text-[rgb(var(--text-secondary))] leading-relaxed">
                  {t('inspiration.flexboxExample')}
                </p>
                <div className="mt-4 text-xs text-[rgb(var(--text-tertiary))]">
                  ↓
                </div>
                <div className="text-2xl mt-2">🐧</div>
                <p className="text-xs text-[rgb(var(--text-tertiary))] mt-2">
                  {t('inspiration.penguinExample')}
                </p>
              </div>
            </div>
          </motion.section>

          {/* 바이브 코딩 경험 */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <h2 className="text-3xl font-bold text-[rgb(var(--text-primary))] mb-8 flex items-center gap-3">
              🤖 <span>{t('vibreCoding.title')}</span>
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-[rgb(var(--surface-elevated))] rounded-2xl p-6 shadow-lg">
                <div className="text-3xl mb-4">💭</div>
                <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-3">{t('vibreCoding.ideation.title')}</h3>
                <p className="text-sm text-[rgb(var(--text-secondary))] leading-relaxed">
                  {t('vibreCoding.ideation.content')}
                </p>
              </div>
              <div className="bg-[rgb(var(--surface-elevated))] rounded-2xl p-6 shadow-lg">
                <div className="text-3xl mb-4">🎨</div>
                <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-3">{t('vibreCoding.wireframe.title')}</h3>
                <p className="text-sm text-[rgb(var(--text-secondary))] leading-relaxed">
                  {t('vibreCoding.wireframe.content')}
                </p>
              </div>
              <div className="bg-[rgb(var(--surface-elevated))] rounded-2xl p-6 shadow-lg">
                <div className="text-3xl mb-4">🔧</div>
                <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-3">{t('vibreCoding.iteration.title')}</h3>
                <p className="text-sm text-[rgb(var(--text-secondary))] leading-relaxed">
                  {t('vibreCoding.iteration.content')}
                </p>
              </div>
            </div>

            <div className="mt-8 bg-[rgb(var(--surface-elevated))] rounded-2xl p-8 shadow-lg">
              <h3 className="text-xl font-semibold text-[rgb(var(--text-primary))] mb-4">
                {t('vibreCoding.insights')}
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-[rgb(var(--text-primary))] mb-2">✅ {t('vibreCoding.aiAdvantages.title')}</h4>
                  <ul className="text-sm text-[rgb(var(--text-secondary))] space-y-1">
                    <li>• {t('vibreCoding.aiAdvantages.item1')}</li>
                    <li>• {t('vibreCoding.aiAdvantages.item2')}</li>
                    <li>• {t('vibreCoding.aiAdvantages.item3')}</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-[rgb(var(--text-primary))] mb-2">🎯 {t('vibreCoding.stillImportant.title')}</h4>
                  <ul className="text-sm text-[rgb(var(--text-secondary))] space-y-1">
                    <li>• {t('vibreCoding.stillImportant.item1')}</li>
                    <li>• {t('vibreCoding.stillImportant.item2')}</li>
                    <li>• {t('vibreCoding.stillImportant.item3')}</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.section>

          {/* 현재 상태와 미래 계획 */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-[rgb(var(--text-primary))] mb-8 flex items-center gap-3">
              🚀 <span>{t('currentAndFuture.title')}</span>
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-[rgb(var(--surface-elevated))] rounded-2xl p-8 shadow-lg">
                <h3 className="text-xl font-semibold text-[rgb(var(--text-primary))] mb-6">
                  📊 {t('currentAndFuture.currentStatus.title')}
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[rgb(var(--text-secondary))]">{t('currentAndFuture.currentStatus.completedGames')}</span>
                    <span className="font-bold text-[rgb(var(--primary))]">2 / 18{t('currentAndFuture.currentStatus.completedGames') === '완성된 게임' ? '개' : ''}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[rgb(var(--text-secondary))]">{t('currentAndFuture.currentStatus.implementedStages')}</span>
                    <span className="font-bold text-green-600">39 / 270{t('currentAndFuture.currentStatus.implementedStages') === '구현된 스테이지' ? '개' : ''}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[rgb(var(--text-secondary))]">{t('currentAndFuture.currentStatus.overallProgress')}</span>
                    <span className="font-bold text-blue-600">14.4%</span>
                  </div>
                  <div className="w-full bg-[rgb(var(--surface-secondary))] rounded-full h-2 mt-4">
                    <div className="bg-[rgb(var(--primary))] h-2 rounded-full" style={{ width: '14.4%' }}></div>
                  </div>
                </div>
              </div>

              <div className="bg-[rgb(var(--surface-elevated))] rounded-2xl p-8 shadow-lg">
                <h3 className="text-xl font-semibold text-[rgb(var(--text-primary))] mb-6">
                  🎯 {t('currentAndFuture.futurePlans.title')}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-[rgb(var(--primary))] mt-1">•</span>
                    <span className="text-[rgb(var(--text-secondary))]">
                      {t('currentAndFuture.futurePlans.item1')}
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-[rgb(var(--primary))] mt-1">•</span>
                    <span className="text-[rgb(var(--text-secondary))]">
                      {t('currentAndFuture.futurePlans.item2')}
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-[rgb(var(--primary))] mt-1">•</span>
                    <span className="text-[rgb(var(--text-secondary))]">
                      {t('currentAndFuture.futurePlans.item3')}
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-[rgb(var(--primary))] mt-1">•</span>
                    <span className="text-[rgb(var(--text-secondary))]">
                      {t('currentAndFuture.futurePlans.item4')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* 개인적 소감 */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="bg-gradient-to-r from-[rgb(var(--penguin-50))] to-[rgb(var(--penguin-100))] dark:from-[rgb(var(--slate-800))] dark:to-[rgb(var(--slate-700))] rounded-2xl p-8 shadow-lg"
          >
            <h2 className="text-2xl font-bold text-[rgb(var(--text-primary))] mb-6 text-center">
              💭 {t('personalReflection.title')}
            </h2>
            <div className="max-w-3xl mx-auto text-[rgb(var(--text-secondary))] leading-relaxed">
              <p className="mb-4">
                {t('personalReflection.content1').split('무엇을 만들지')[0]}
                <strong className="text-[rgb(var(--text-primary))]">
                  {t('personalReflection.content1').includes('무엇을 만들지') ? '무엇을 만들지, 어떻게 사용자가 학습할지' : 'what to build and how users will learn'}
                </strong>
                {t('personalReflection.content1').split('어떻게 사용자가 학습할지')[1] || t('personalReflection.content1').split('how users will learn')[1]}
              </p>
              <p className="mb-4">
                {t('personalReflection.content2').split('문제를 정의하고')[0]}
                <strong className="text-[rgb(var(--text-primary))]">
                  {t('personalReflection.content2').includes('문제를 정의하고') ? '문제를 정의하고 해결 방향을 제시하는 능력' : 'the ability to define problems and suggest solutions'}
                </strong>
                {t('personalReflection.content2').split('제시하는 능력')[1] || t('personalReflection.content2').split('suggest solutions')[1]}
              </p>
              <p className="text-center font-medium text-[rgb(var(--text-primary))] mt-6">
                {t('personalReflection.quote')}
              </p>
            </div>
          </motion.section>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="text-center mt-16"
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/${currentLocale}/games`}
              className="inline-flex items-center justify-center gap-3 bg-[rgb(var(--primary))] text-white px-8 py-4 rounded-xl hover:bg-[rgb(var(--primary-hover))] transition-all duration-300 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              🎮 {t('cta.playGames')}
              <span className="text-xl">→</span>
            </Link>
            <Link
              href={`/${currentLocale}/tech`}
              className="inline-flex items-center justify-center gap-3 bg-[rgb(var(--surface-elevated))] text-[rgb(var(--text-primary))] px-8 py-4 rounded-xl hover:bg-[rgb(var(--surface-secondary))] transition-all duration-300 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              🔧 {t('cta.viewTechStack')}
              <span className="text-xl">→</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  )
}