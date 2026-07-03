'use client'

import { useEffect, useMemo, useState } from 'react'
import { children } from '@/lib/mock-data'

const storageKey = 'kxb-parent-selected-child-id'

function getValidChildId(childId: string | null) {
  return children.some((child) => child.id === childId) ? childId : children[0]?.id
}

export function useSelectedChild() {
  const [selectedChildId, setSelectedChildIdState] = useState(children[0]?.id || '')

  useEffect(() => {
    const savedChildId = getValidChildId(window.localStorage.getItem(storageKey))
    if (savedChildId) {
      setSelectedChildIdState(savedChildId)
    }
  }, [])

  const selectedChild = useMemo(
    () => children.find((child) => child.id === selectedChildId) || children[0],
    [selectedChildId],
  )

  const setSelectedChildId = (childId: string) => {
    const validChildId = getValidChildId(childId)
    if (!validChildId) return

    setSelectedChildIdState(validChildId)
    window.localStorage.setItem(storageKey, validChildId)
  }

  const switchChild = () => {
    const currentIndex = children.findIndex((child) => child.id === selectedChild.id)
    const nextChild = children[(currentIndex + 1) % children.length] || children[0]
    setSelectedChildId(nextChild.id)
  }

  return {
    selectedChild,
    selectedChildId: selectedChild.id,
    setSelectedChildId,
    switchChild,
  }
}
