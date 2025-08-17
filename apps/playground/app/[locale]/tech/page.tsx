'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { ThemeToggle, LanguageToggle } from '@penguinjs/ui'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, ExternalLink, Zap, Shield, Layers, Cpu } from 'lucide-react'

export default function TechPage() {
  const t = useTranslations('TechPage')
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
              <span className="font-medium">{t('homeLink')}</span>
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
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* 인트로 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-[rgb(var(--text-primary))] mb-6">
            {t('hero.title')}
          </h1>
          <p className="text-xl text-[rgb(var(--text-secondary))] max-w-3xl mx-auto leading-relaxed">
            {t('hero.description')}
          </p>
        </motion.div>

        {/* 핵심 기술 스택 */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-[rgb(var(--text-primary))] mb-8 text-center">
            {t('coreStack.title')}
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Frontend */}
            <motion.div 
              className="bg-[rgb(var(--surface-elevated))] rounded-2xl p-8 shadow-lg"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-4xl mb-6 text-center">⚛️</div>
              <h3 className="text-2xl font-semibold text-[rgb(var(--text-primary))] mb-6 text-center">{t('coreStack.frontend.title')}</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-[#61dafb] rounded-full"></div>
                  <div>
                    <div className="font-medium text-[rgb(var(--text-primary))]">{t('coreStack.frontend.react.name')}</div>
                    <div className="text-sm text-[rgb(var(--text-tertiary))]">{t('coreStack.frontend.react.description')}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-black dark:bg-white rounded-full"></div>
                  <div>
                    <div className="font-medium text-[rgb(var(--text-primary))]">{t('coreStack.frontend.nextjs.name')}</div>
                    <div className="text-sm text-[rgb(var(--text-tertiary))]">{t('coreStack.frontend.nextjs.description')}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-[#3178c6] rounded-full"></div>
                  <div>
                    <div className="font-medium text-[rgb(var(--text-primary))]">{t('coreStack.frontend.typescript.name')}</div>
                    <div className="text-sm text-[rgb(var(--text-tertiary))]">{t('coreStack.frontend.typescript.description')}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-[#0055ff] rounded-full"></div>
                  <div>
                    <div className="font-medium text-[rgb(var(--text-primary))]">{t('coreStack.frontend.framerMotion.name')}</div>
                    <div className="text-sm text-[rgb(var(--text-tertiary))]">{t('coreStack.frontend.framerMotion.description')}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-[#38bdf8] rounded-full"></div>
                  <div>
                    <div className="font-medium text-[rgb(var(--text-primary))]">{t('coreStack.frontend.tailwind.name')}</div>
                    <div className="text-sm text-[rgb(var(--text-tertiary))]">{t('coreStack.frontend.tailwind.description')}</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Architecture */}
            <motion.div 
              className="bg-[rgb(var(--surface-elevated))] rounded-2xl p-8 shadow-lg"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-4xl mb-6 text-center">🏗️</div>
              <h3 className="text-2xl font-semibold text-[rgb(var(--text-primary))] mb-6 text-center">{t('coreStack.architecture.title')}</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Layers className="w-4 h-4 text-[rgb(var(--primary))]" />
                  <div>
                    <div className="font-medium text-[rgb(var(--text-primary))]">{t('coreStack.architecture.monorepo.name')}</div>
                    <div className="text-sm text-[rgb(var(--text-tertiary))]">{t('coreStack.architecture.monorepo.description')}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Cpu className="w-4 h-4 text-[rgb(var(--primary))]" />
                  <div>
                    <div className="font-medium text-[rgb(var(--text-primary))]">{t('coreStack.architecture.singleton.name')}</div>
                    <div className="text-sm text-[rgb(var(--text-tertiary))]">{t('coreStack.architecture.singleton.description')}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Zap className="w-4 h-4 text-[rgb(var(--primary))]" />
                  <div>
                    <div className="font-medium text-[rgb(var(--text-primary))]">{t('coreStack.architecture.stateManagement.name')}</div>
                    <div className="text-sm text-[rgb(var(--text-tertiary))]">{t('coreStack.architecture.stateManagement.description')}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-[rgb(var(--primary))]" />
                  <div>
                    <div className="font-medium text-[rgb(var(--text-primary))]">{t('coreStack.architecture.componentSeparation.name')}</div>
                    <div className="text-sm text-[rgb(var(--text-tertiary))]">{t('coreStack.architecture.componentSeparation.description')}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-[rgb(var(--primary))] rounded-full"></div>
                  <div>
                    <div className="font-medium text-[rgb(var(--text-primary))]">{t('coreStack.architecture.customHooks.name')}</div>
                    <div className="text-sm text-[rgb(var(--text-tertiary))]">{t('coreStack.architecture.customHooks.description')}</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Features */}
            <motion.div 
              className="bg-[rgb(var(--surface-elevated))] rounded-2xl p-8 shadow-lg"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-4xl mb-6 text-center">🎮</div>
              <h3 className="text-2xl font-semibold text-[rgb(var(--text-primary))] mb-6 text-center">{t('coreStack.features.title')}</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-[#ff6b6b] rounded-full"></div>
                  <div>
                    <div className="font-medium text-[rgb(var(--text-primary))]">{t('coreStack.features.interactiveGames.name')}</div>
                    <div className="text-sm text-[rgb(var(--text-tertiary))]">{t('coreStack.features.interactiveGames.description')}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-[#4ecdc4] rounded-full"></div>
                  <div>
                    <div className="font-medium text-[rgb(var(--text-primary))]">{t('coreStack.features.realtimeVisualization.name')}</div>
                    <div className="text-sm text-[rgb(var(--text-tertiary))]">{t('coreStack.features.realtimeVisualization.description')}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-[#45b7d1] rounded-full"></div>
                  <div>
                    <div className="font-medium text-[rgb(var(--text-primary))]">{t('coreStack.features.multiLanguage.name')}</div>
                    <div className="text-sm text-[rgb(var(--text-tertiary))]">{t('coreStack.features.multiLanguage.description')}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-[#f7b731] rounded-full"></div>
                  <div>
                    <div className="font-medium text-[rgb(var(--text-primary))]">{t('coreStack.features.responsiveDesign.name')}</div>
                    <div className="text-sm text-[rgb(var(--text-tertiary))]">{t('coreStack.features.responsiveDesign.description')}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-[#5f27cd] rounded-full"></div>
                  <div>
                    <div className="font-medium text-[rgb(var(--text-primary))]">{t('coreStack.features.darkMode.name')}</div>
                    <div className="text-sm text-[rgb(var(--text-tertiary))]">{t('coreStack.features.darkMode.description')}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* 아키텍처 다이어그램 */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-[rgb(var(--text-primary))] mb-8 text-center">
            {t('architecture.title')}
          </h2>
          
          <div className="bg-[rgb(var(--surface-elevated))] rounded-2xl p-8 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Presentation Layer */}
              <div className="text-center">
                <div className="bg-[rgb(var(--primary))]/10 rounded-xl p-6 mb-4">
                  <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-4">
                    {t('architecture.presentationLayer.title')}
                  </h3>
                  <div className="space-y-2 text-sm text-[rgb(var(--text-secondary))]">
                    <div className="bg-[rgb(var(--surface-secondary))] rounded p-2">{t('architecture.presentationLayer.components.reactComponents')}</div>
                    <div className="bg-[rgb(var(--surface-secondary))] rounded p-2">{t('architecture.presentationLayer.components.framerMotion')}</div>
                    <div className="bg-[rgb(var(--surface-secondary))] rounded p-2">{t('architecture.presentationLayer.components.tailwindCSS')}</div>
                  </div>
                </div>
                <div className="text-xs text-[rgb(var(--text-tertiary))]">{t('architecture.presentationLayer.description')}</div>
              </div>

              {/* Business Logic */}
              <div className="text-center">
                <div className="bg-[rgb(var(--primary))]/10 rounded-xl p-6 mb-4">
                  <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-4">
                    {t('architecture.businessLogic.title')}
                  </h3>
                  <div className="space-y-2 text-sm text-[rgb(var(--text-secondary))]">
                    <div className="bg-[rgb(var(--surface-secondary))] rounded p-2">{t('architecture.businessLogic.components.gameEngine')}</div>
                    <div className="bg-[rgb(var(--surface-secondary))] rounded p-2">{t('architecture.businessLogic.components.stateManagement')}</div>
                    <div className="bg-[rgb(var(--surface-secondary))] rounded p-2">{t('architecture.businessLogic.components.memoryMonitor')}</div>
                  </div>
                </div>
                <div className="text-xs text-[rgb(var(--text-tertiary))]">{t('architecture.businessLogic.description')}</div>
              </div>

              {/* Data Layer */}
              <div className="text-center">
                <div className="bg-[rgb(var(--primary))]/10 rounded-xl p-6 mb-4">
                  <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-4">
                    {t('architecture.dataLayer.title')}
                  </h3>
                  <div className="space-y-2 text-sm text-[rgb(var(--text-secondary))]">
                    <div className="bg-[rgb(var(--surface-secondary))] rounded p-2">{t('architecture.dataLayer.components.levelConfigurations')}</div>
                    <div className="bg-[rgb(var(--surface-secondary))] rounded p-2">{t('architecture.dataLayer.components.userProgress')}</div>
                    <div className="bg-[rgb(var(--surface-secondary))] rounded p-2">{t('architecture.dataLayer.components.i18nResources')}</div>
                  </div>
                </div>
                <div className="text-xs text-[rgb(var(--text-tertiary))]">{t('architecture.dataLayer.description')}</div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <div className="text-sm text-[rgb(var(--text-tertiary))] mb-2">{t('architecture.dataFlow.title')}</div>
              <div className="flex items-center justify-center gap-4 text-xs text-[rgb(var(--text-secondary))]">
                <span>{t('architecture.dataFlow.userInput')}</span>
                <span>{t('architecture.dataFlow.arrow')}</span>
                <span>{t('architecture.dataFlow.gameLogic')}</span>
                <span>{t('architecture.dataFlow.arrow')}</span>
                <span>{t('architecture.dataFlow.stateUpdate')}</span>
                <span>{t('architecture.dataFlow.arrow')}</span>
                <span>{t('architecture.dataFlow.uiRendering')}</span>
              </div>
            </div>
          </div>
        </motion.section>

        {/* 개발 도구 & 설정 */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-[rgb(var(--text-primary))] mb-8 text-center">
            {t('devTools.title')}
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-[rgb(var(--surface-elevated))] rounded-2xl p-8 shadow-lg">
              <h3 className="text-xl font-semibold text-[rgb(var(--text-primary))] mb-6">{t('devTools.devTools.title')}</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-[#4f46e5] rounded-full"></div>
                    <span className="text-[rgb(var(--text-primary))]">{t('devTools.devTools.tools.claudeCode.name')}</span>
                  </div>
                  <span className="text-sm text-[rgb(var(--text-tertiary))]">{t('devTools.devTools.tools.claudeCode.description')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-[#f05032] rounded-full"></div>
                    <span className="text-[rgb(var(--text-primary))]">{t('devTools.devTools.tools.git.name')}</span>
                  </div>
                  <span className="text-sm text-[rgb(var(--text-tertiary))]">{t('devTools.devTools.tools.git.description')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-[#f1a85a] rounded-full"></div>
                    <span className="text-[rgb(var(--text-primary))]">{t('devTools.devTools.tools.pnpm.name')}</span>
                  </div>
                  <span className="text-sm text-[rgb(var(--text-tertiary))]">{t('devTools.devTools.tools.pnpm.description')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-[#007acc] rounded-full"></div>
                    <span className="text-[rgb(var(--text-primary))]">{t('devTools.devTools.tools.vsCode.name')}</span>
                  </div>
                  <span className="text-sm text-[rgb(var(--text-tertiary))]">{t('devTools.devTools.tools.vsCode.description')}</span>
                </div>
              </div>
            </div>

            <div className="bg-[rgb(var(--surface-elevated))] rounded-2xl p-8 shadow-lg">
              <h3 className="text-xl font-semibold text-[rgb(var(--text-primary))] mb-6">{t('devTools.performance.title')}</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full mt-1"></div>
                  <div>
                    <div className="font-medium text-[rgb(var(--text-primary))]">{t('devTools.performance.memoryMonitoring.name')}</div>
                    <div className="text-sm text-[rgb(var(--text-secondary))]">{t('devTools.performance.memoryMonitoring.description')}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mt-1"></div>
                  <div>
                    <div className="font-medium text-[rgb(var(--text-primary))]">{t('devTools.performance.bundleOptimization.name')}</div>
                    <div className="text-sm text-[rgb(var(--text-secondary))]">{t('devTools.performance.bundleOptimization.description')}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mt-1"></div>
                  <div>
                    <div className="font-medium text-[rgb(var(--text-primary))]">{t('devTools.performance.imageOptimization.name')}</div>
                    <div className="text-sm text-[rgb(var(--text-secondary))]">{t('devTools.performance.imageOptimization.description')}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mt-1"></div>
                  <div>
                    <div className="font-medium text-[rgb(var(--text-primary))]">{t('devTools.performance.animationOptimization.name')}</div>
                    <div className="text-sm text-[rgb(var(--text-secondary))]">{t('devTools.performance.animationOptimization.description')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* 배운 점과 도전 과제 */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-[rgb(var(--text-primary))] mb-8 text-center">
            {t('challenges.title')}
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-2xl p-8 shadow-lg">
              <h3 className="text-xl font-semibold text-[rgb(var(--text-primary))] mb-6">{t('challenges.challenges.title')}</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-[rgb(var(--text-primary))] mb-2">{t('challenges.challenges.memoryLeak.title')}</h4>
                  <p className="text-sm text-[rgb(var(--text-secondary))]">
                    {t('challenges.challenges.memoryLeak.description')}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-[rgb(var(--text-primary))] mb-2">{t('challenges.challenges.complexAnimation.title')}</h4>
                  <p className="text-sm text-[rgb(var(--text-secondary))]">
                    {t('challenges.challenges.complexAnimation.description')}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-[rgb(var(--text-primary))] mb-2">{t('challenges.challenges.layoutSystem.title')}</h4>
                  <p className="text-sm text-[rgb(var(--text-secondary))]">
                    {t('challenges.challenges.layoutSystem.description')}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl p-8 shadow-lg">
              <h3 className="text-xl font-semibold text-[rgb(var(--text-primary))] mb-6">{t('challenges.solutions.title')}</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-[rgb(var(--text-primary))] mb-2">{t('challenges.solutions.singletonPattern.title')}</h4>
                  <p className="text-sm text-[rgb(var(--text-secondary))]">
                    {t('challenges.solutions.singletonPattern.description')}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-[rgb(var(--text-primary))] mb-2">{t('challenges.solutions.reactRef.title')}</h4>
                  <p className="text-sm text-[rgb(var(--text-secondary))]">
                    {t('challenges.solutions.reactRef.description')}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-[rgb(var(--text-primary))] mb-2">{t('challenges.solutions.componentAbstraction.title')}</h4>
                  <p className="text-sm text-[rgb(var(--text-secondary))]">
                    {t('challenges.solutions.componentAbstraction.description')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* 성능 지표 */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-[rgb(var(--text-primary))] mb-8 text-center">
            {t('performance.title')}
          </h2>
          
          <div className="bg-[rgb(var(--surface-elevated))] rounded-2xl p-8 shadow-lg">
            <div className="space-y-6">
              {/* 메모리 모니터링 시스템 */}
              <div className="bg-[rgb(var(--surface-secondary))] rounded-xl p-6">
                <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-4">
                  {t('performance.memoryMonitoring.title')}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <div className="font-medium text-[rgb(var(--text-primary))]">{t('performance.memoryMonitoring.chromeApi.title')}</div>
                      <div className="text-sm text-[rgb(var(--text-secondary))]">{t('performance.memoryMonitoring.chromeApi.description')}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <div className="font-medium text-[rgb(var(--text-primary))]">{t('performance.memoryMonitoring.singletonImplementation.title')}</div>
                      <div className="text-sm text-[rgb(var(--text-secondary))]">{t('performance.memoryMonitoring.singletonImplementation.description')}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div>
                      <div className="font-medium text-[rgb(var(--text-primary))]">{t('performance.memoryMonitoring.autoCleanup.title')}</div>
                      <div className="text-sm text-[rgb(var(--text-secondary))]">{t('performance.memoryMonitoring.autoCleanup.description')}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <div>
                      <div className="font-medium text-[rgb(var(--text-primary))]">{t('performance.memoryMonitoring.thresholdAlerts.title')}</div>
                      <div className="text-sm text-[rgb(var(--text-secondary))]">{t('performance.memoryMonitoring.thresholdAlerts.description')}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 실제 측정 결과 */}
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center bg-[rgb(var(--surface-secondary))] rounded-xl p-6">
                  <div className="text-3xl font-bold text-[rgb(var(--primary))] mb-2">{t('performance.metrics.optimizedMemory.value')}</div>
                  <div className="text-sm text-[rgb(var(--text-secondary))]">{t('performance.metrics.optimizedMemory.label')}</div>
                  <div className="text-xs text-green-600 mt-1">{t('performance.metrics.optimizedMemory.change')}</div>
                </div>
                <div className="text-center bg-[rgb(var(--surface-secondary))] rounded-xl p-6">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{t('performance.metrics.realtimeMonitoring.value')}</div>
                  <div className="text-sm text-[rgb(var(--text-secondary))]">{t('performance.metrics.realtimeMonitoring.label')}</div>
                  <div className="text-xs text-blue-600 mt-1">{t('performance.metrics.realtimeMonitoring.description')}</div>
                </div>
              </div>

              <div className="text-sm text-[rgb(var(--text-tertiary))] text-center">
                {t('performance.note')}
              </div>
            </div>
          </div>
        </motion.section>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/${currentLocale}/games`}
              className="inline-flex items-center justify-center gap-3 bg-[rgb(var(--primary))] text-white px-8 py-4 rounded-xl hover:bg-[rgb(var(--primary-hover))] transition-all duration-300 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              {t('cta.tryTech')}
              <span className="text-xl">{t('cta.arrow')}</span>
            </Link>
            <Link
              href={`/${currentLocale}/about`}
              className="inline-flex items-center justify-center gap-3 bg-[rgb(var(--surface-elevated))] text-[rgb(var(--text-primary))] px-8 py-4 rounded-xl hover:bg-[rgb(var(--surface-secondary))] transition-all duration-300 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              {t('cta.projectStory')}
              <span className="text-xl">{t('cta.arrow')}</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  )
}