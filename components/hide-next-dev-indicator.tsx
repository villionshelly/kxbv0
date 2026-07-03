'use client'

import { useEffect } from 'react'

export function HideNextDevIndicator() {
  useEffect(() => {
    const hideIndicator = () => {
      document.querySelectorAll<HTMLElement>('nextjs-portal').forEach((portal) => {
        portal.style.setProperty('display', 'none', 'important')
        portal.style.setProperty('visibility', 'hidden', 'important')
        portal.style.setProperty('pointer-events', 'none', 'important')
      })
    }

    hideIndicator()

    const observer = new MutationObserver(hideIndicator)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => observer.disconnect()
  }, [])

  return null
}
