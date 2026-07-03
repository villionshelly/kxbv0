'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, Home } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'

type SubpageQuickNavProps = {
  section: 'parent' | 'institution'
}

const routeTitleOverrides: Array<[RegExp, string]> = [
  [/^\/parent\/assets$/, '课时资产'],
  [/^\/parent\/bills$/, '我的账单'],
  [/^\/parent\/contracts$/, '我的合同'],
  [/^\/parent\/account$/, '个人资料'],
  [/^\/parent\/children$/, '孩子管理'],
  [/^\/parent\/schedule$/, '课程表'],
  [/^\/parent\/add-child$/, '添加宝贝'],
  [/^\/parent\/family-sharing$/, '家庭共享'],
  [/^\/parent\/growth$/, '成长档案'],
  [/^\/parent\/growth\/[^/]+$/, '成长详情'],
  [/^\/parent\/invite$/, '邀请机构入驻'],
  [/^\/parent\/institutions$/, '我的机构'],
  [/^\/parent\/leave$/, '请假记录'],
  [/^\/parent\/profile$/, '个人中心'],
  [/^\/parent\/assistant$/, 'AI助理'],
  [/^\/institution\/assistant$/, 'AI助理'],
  [/^\/institution\/teacher\/assistant$/, 'AI助理'],
  [/^\/institution\/profile$/, '我的'],
]

function getRouteTitle(pathname: string) {
  return routeTitleOverrides.find(([pattern]) => pattern.test(pathname))?.[1] ?? ''
}

function getHeaderTitle(frame: Element) {
  const headings = frame.querySelectorAll('header h1, h1')

  for (const heading of headings) {
    const title = heading.textContent?.replace(/\s+/g, ' ').trim()
    const rect = heading.getBoundingClientRect()
    const frameRect = frame.getBoundingClientRect()
    const nearTop = rect.top - frameRect.top <= 132
    if (title && nearTop) {
      return { element: heading, title }
    }
  }

  return null
}

export function SubpageQuickNav({ section }: SubpageQuickNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const fallbackTitle = getRouteTitle(pathname)
  const [pageTitle, setPageTitle] = useState(fallbackTitle)

  const homeHref =
    section === 'parent'
      ? '/parent'
      : pathname.startsWith('/institution/teacher')
        ? '/institution/teacher'
        : '/institution'

  const homePaths =
    section === 'parent'
      ? ['/parent']
      : ['/institution', '/institution/teacher']

  const showNav = !homePaths.includes(pathname)

  useEffect(() => {
    setPageTitle(fallbackTitle)
  }, [fallbackTitle])

  useEffect(() => {
    if (!showNav) return

    const frame = document.querySelector('.mobile-frame')
    if (!frame) return

    frame.setAttribute('data-global-quick-nav', 'true')

    const hiddenControls = new Set<Element>()
    const hiddenTitles = new Set<Element>()
    let frameRect = frame.getBoundingClientRect()

    const syncLocalHeader = () => {
      frameRect = frame.getBoundingClientRect()
      const controls = frame.querySelectorAll('button, a')

      controls.forEach((control) => {
        if (control.closest('.subpage-quick-nav')) return

        const hasBackIcon = Boolean(control.querySelector('svg.lucide-arrow-left'))
        const label = control.getAttribute('aria-label') || control.textContent || ''
        if (!hasBackIcon && !label.includes('返回')) return

        const rect = control.getBoundingClientRect()
        const nearTop = rect.top - frameRect.top <= 132
        const nearLeft = rect.left - frameRect.left <= 108
        const compact = rect.width <= 112 && rect.height <= 76

        if (nearTop && nearLeft && compact) {
          control.setAttribute('data-local-back-hidden', 'true')
          hiddenControls.add(control)
        }
      })

      hiddenTitles.forEach((title) => {
        title.removeAttribute('data-local-title-hidden')
      })
      hiddenTitles.clear()

      const headerTitle = getHeaderTitle(frame)
      if (headerTitle) {
        headerTitle.element.setAttribute('data-local-title-hidden', 'true')
        hiddenTitles.add(headerTitle.element)
        setPageTitle((currentTitle) =>
          currentTitle === headerTitle.title ? currentTitle : headerTitle.title,
        )
        return
      }

      setPageTitle((currentTitle) =>
        currentTitle === fallbackTitle ? currentTitle : fallbackTitle,
      )
    }

    const frameHandle = window.requestAnimationFrame(syncLocalHeader)
    const observer = new MutationObserver(syncLocalHeader)
    observer.observe(frame, { childList: true, characterData: true, subtree: true })
    window.addEventListener('resize', syncLocalHeader)

    return () => {
      window.cancelAnimationFrame(frameHandle)
      observer.disconnect()
      window.removeEventListener('resize', syncLocalHeader)
      frame.removeAttribute('data-global-quick-nav')
      hiddenControls.forEach((control) => {
        control.removeAttribute('data-local-back-hidden')
      })
      hiddenTitles.forEach((title) => {
        title.removeAttribute('data-local-title-hidden')
      })
    }
  }, [fallbackTitle, pathname, showNav])

  if (!showNav) {
    return null
  }

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back()
      return
    }

    router.push(homeHref)
  }

  return (
    <div
      className="subpage-top-nav pointer-events-none absolute inset-x-0 z-[90]"
      style={{
        top: 'var(--kxb-mp-status-bar-height)',
        height: 'var(--kxb-mp-nav-bar-height)',
      }}
    >
      <div className="subpage-quick-nav pointer-events-auto absolute left-4 top-0 flex h-full items-center gap-3">
        <button
          type="button"
          aria-label="返回"
          onClick={handleBack}
          className="subpage-quick-nav__button flex h-10 w-10 items-center justify-center transition-colors"
        >
          <ArrowLeft className="h-[22px] w-[22px]" strokeWidth={2.15} />
        </button>
        <a
          href={homeHref}
          aria-label="回到首页"
          onClick={(event) => {
            event.preventDefault()
            router.push(homeHref)
          }}
          className="subpage-quick-nav__button flex h-10 w-10 items-center justify-center transition-colors"
        >
          <Home className="h-[22px] w-[22px]" strokeWidth={2.15} />
        </a>
      </div>
      {pageTitle && (
        <div className="subpage-top-nav__title absolute inset-y-0 left-24 right-24 flex items-center justify-center">
          <span>{pageTitle}</span>
        </div>
      )}
    </div>
  )
}
