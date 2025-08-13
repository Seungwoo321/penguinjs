'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

interface ThemeAwarePortalProps {
  children: React.ReactNode
  containerId?: string
}

export function ThemeAwarePortal({ 
  children, 
  containerId = 'theme-portal-root' 
}: ThemeAwarePortalProps) {
  const [mounted, setMounted] = useState(false)
  const portalRef = useRef<HTMLDivElement | null>(null)
  
  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    if (typeof window === 'undefined') return
    
    // Portal 컨테이너 생성 또는 찾기
    let container = document.getElementById(containerId)
    if (!container) {
      container = document.createElement('div')
      container.id = containerId
      container.className = 'contents' // 레이아웃에 영향 없음
      document.body.appendChild(container)
    }
    
    portalRef.current = container as HTMLDivElement
    
    // CSS 커스텀 프로퍼티 동기화
    const syncCustomProperties = () => {
      if (!portalRef.current || typeof window === 'undefined') return
      
      try {
        const documentElement = document.documentElement
        const computedStyle = window.getComputedStyle(documentElement)
        
        // 모든 CSS 변수 가져오기
        const allStyles = Array.from(computedStyle)
        const customProps = allStyles.filter(prop => prop.startsWith('--'))
        
        // Portal 컨테이너에 적용
        customProps.forEach(prop => {
          const value = computedStyle.getPropertyValue(prop)
          if (value && portalRef.current) {
            portalRef.current.style.setProperty(prop, value)
          }
        })
        
        // 테마 클래스도 동기화
        const isDark = documentElement.classList.contains('dark')
        if (portalRef.current) {
          portalRef.current.classList.toggle('dark', isDark)
        }
      } catch (error) {
        console.warn('ThemeAwarePortal: Failed to sync theme properties', error)
      }
    }
    
    // 초기 동기화
    syncCustomProperties()
    
    // 테마 변경 감지
    const observer = new MutationObserver((mutations) => {
      try {
        const hasRelevantChange = mutations.some(
          mutation => 
            mutation.type === 'attributes' &&
            (mutation.attributeName === 'class' || 
             mutation.attributeName === 'style')
        )
        
        if (hasRelevantChange) {
          syncCustomProperties()
        }
      } catch (error) {
        console.warn('ThemeAwarePortal: Failed to handle theme change', error)
      }
    })
    
    if (typeof window !== 'undefined') {
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class', 'style'],
        subtree: false
      })
    }
    
    setMounted(true)
    
    return () => {
      try {
        observer.disconnect()
        // 다른 포털이 사용할 수 있으므로 컨테이너는 제거하지 않음
      } catch (error) {
        console.warn('ThemeAwarePortal: Failed to cleanup', error)
      }
    }
  }, [containerId])
  
  if (!mounted || !portalRef.current || typeof window === 'undefined') {
    return null
  }
  
  return createPortal(children, portalRef.current)
}