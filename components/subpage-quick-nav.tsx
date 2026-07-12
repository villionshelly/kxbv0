'use client'

import { useEffect, useRef, useState } from 'react'
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
  [/^\/parent\/join$/, '家长绑定邀请'],
  [/^\/parent\/institutions$/, '我的机构'],
  [/^\/parent\/leave$/, '请假记录'],
  [/^\/parent\/profile$/, '个人中心'],
  [/^\/parent\/assistant$/, 'AI助理'],
  [/^\/institution\/assistant$/, 'AI助理'],
  [/^\/institution\/teacher\/assistant$/, 'AI助理'],
  [/^\/institution\/contracts$/, '合同管理'],
  [/^\/institution\/profile$/, '我的'],
  [/^\/institution\/profile\/institution-info$/, '机构信息'],
  [/^\/institution\/profile\/account$/, '个人资料'],
  [/^\/institution\/staff\/[^/]+\/students$/, '学员名单'],
  [/^\/institution\/staff\/[^/]+\/classes$/, '每周班次'],
  [/^\/institution\/staff\/invite$/, '新增员工'],
  [/^\/institution\/staff\/invite\/admin$/, '邀请管理员'],
  [/^\/institution\/staff\/invite\/teacher$/, '邀请教师'],
  [/^\/institution\/staff\/invite-poster$/, '新增员工'],
  [/^\/institution\/staff$/, '员工管理'],
  [/^\/institution\/students\/[^/]+$/, '学员详情'],
  [/^\/institution\/students\/[^/]+\/purchase-records$/, '购买记录'],
  [/^\/institution\/students\/[^/]+\/add-course$/, '添加课程'],
  [/^\/institution\/students\/[^/]+\/renew$/, '续费登记'],
  [/^\/institution\/schedule\/[^/]+$/, '课程核销'],
  [/^\/institution\/teacher\/assistant$/, 'AI助理'],
  [/^\/institution\/teacher\/consumption-records$/, '销课记录'],
  [/^\/institution\/teacher\/growth-report$/, '成长报告'],
  [/^\/institution\/teacher\/highlights$/, '精彩瞬间'],
  [/^\/institution\/teacher\/photo-attendance$/, '拍照点名'],
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
    const nearTop = rect.top - frameRect.top <= 260
    if (title && nearTop) {
      return { element: heading, title }
    }
  }

  return null
}

function getLocalHeaderContainer(heading: Element, frame: Element) {
  const container = heading.closest('header, [class*="sticky"], [class*="safe-area-top"]')
  if (!container || container.closest('.subpage-top-nav')) return null

  const frameRect = frame.getBoundingClientRect()
  const rect = container.getBoundingClientRect()
  const isNearTop = rect.top - frameRect.top <= 260
  const isCompact = rect.height > 0 && rect.height <= 120

  return isNearTop && isCompact ? container : null
}

export function SubpageQuickNav({ section }: SubpageQuickNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const fallbackTitle = getRouteTitle(pathname)
  const [pageTitle, setPageTitle] = useState(fallbackTitle)
  const navBarRef = useRef<HTMLDivElement>(null)

  const homeHref =
    section === 'parent'
      ? '/parent'
      : pathname.startsWith('/institution/teacher')
        ? '/institution/teacher'
        : '/institution'

  const homePaths =
    section === 'parent'
      ? ['/parent']
      : ['/institution', '/institution/students', '/institution/schedule', '/institution/profile', '/institution/teacher']

  const showNav = !homePaths.includes(pathname)
  const useWarmNav = section === 'parent' && pathname === '/parent/assistant'

  useEffect(() => {
    setPageTitle(fallbackTitle)
  }, [fallbackTitle])

  useEffect(() => {
    if (!showNav) return

    const frame = document.querySelector<HTMLElement>('.mobile-frame')
    if (!frame) return

    const cacheKey = 'kxb-mini-program-nav-metrics-v1'
    const applyMetrics = (statusBarHeight: number, totalNavHeight: number) => {
      frame.style.setProperty('--kxb-mp-status-bar-height', `${statusBarHeight}px`)
      frame.style.setProperty('--kxb-mp-total-nav-height', `${totalNavHeight}px`)
    }

    try {
      const cached = sessionStorage.getItem(cacheKey)
      if (cached) {
        const metrics = JSON.parse(cached) as { statusBarHeight: number; totalNavHeight: number }
        if (Number.isFinite(metrics.statusBarHeight) && Number.isFinite(metrics.totalNavHeight)) {
          applyMetrics(metrics.statusBarHeight, metrics.totalNavHeight)
          return
        }
      }
    } catch {
      sessionStorage.removeItem(cacheKey)
    }

    const fallbackStatus = Number.parseFloat(getComputedStyle(frame).getPropertyValue('--kxb-mp-status-bar-height')) || 0
    const navHeight = navBarRef.current?.getBoundingClientRect().height || Number.parseFloat(getComputedStyle(frame).getPropertyValue('--kxb-mp-nav-bar-height')) || 0
    const wx = (globalThis as typeof globalThis & {
      wx?: { getSystemInfoSync?: () => { statusBarHeight?: number }; getMenuButtonBoundingClientRect?: () => DOMRect }
    }).wx
    const statusBarHeight = wx?.getSystemInfoSync?.().statusBarHeight ?? fallbackStatus
    const capsule = wx?.getMenuButtonBoundingClientRect?.()
    const capsuleBottom = capsule ? capsule.bottom + Math.max(capsule.top - statusBarHeight, 0) : 0
    const totalNavHeight = Math.max(statusBarHeight + navHeight, capsuleBottom)
    const metrics = { statusBarHeight, totalNavHeight }

    applyMetrics(metrics.statusBarHeight, metrics.totalNavHeight)
    sessionStorage.setItem(cacheKey, JSON.stringify(metrics))
  }, [showNav])

  useEffect(() => {
    if (!showNav) return

    const frame = document.querySelector('.mobile-frame')
    if (!frame) return

    frame.setAttribute('data-global-quick-nav', 'true')

    const hiddenControls = new Set<Element>()
    const hiddenTitles = new Set<Element>()
    const hiddenHeaders = new Set<Element>()
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
        const localHeader = getLocalHeaderContainer(headerTitle.element, frame)
        if (localHeader) {
          localHeader.setAttribute('data-local-header-hidden', 'true')
          hiddenHeaders.add(localHeader)
        }
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

    const frameHandle = window.requestAnimationFrame(() => {
      syncLocalHeader()
      window.requestAnimationFrame(syncLocalHeader)
    })
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
      hiddenHeaders.forEach((header) => {
        header.removeAttribute('data-local-header-hidden')
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
      data-tone={useWarmNav ? 'warm' : undefined}
      style={{
        top: 0,
        height: 'var(--kxb-mp-header-height)',
      }}
    >
      <div
        className="subpage-quick-nav pointer-events-auto absolute left-4 flex items-center gap-3"
        style={{
          top: 'var(--kxb-mp-status-bar-height)',
          height: 'var(--kxb-mp-nav-bar-height)',
        }}
      >
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
        <div
          className="subpage-top-nav__title absolute left-24 right-24 flex items-center justify-center"
          ref={navBarRef}
          style={{ top: 'var(--kxb-mp-status-bar-height)', height: 'var(--kxb-mp-nav-bar-height)' }}
        >
          <span>{pageTitle}</span>
        </div>
      )}
    </div>
  )
}
