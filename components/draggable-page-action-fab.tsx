'use client'

import { useEffect, useRef, useState, type ComponentType } from 'react'

type Point = { x: number; y: number }

type DraggablePageActionFabProps = {
  actionId: string
  label: string
  icon: ComponentType<{ className?: string }>
  onClick: () => void
  reservedBottom?: number
}

const fabHeight = 56
const fabWidth = 116
const edgePadding = 16

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function getBounds(reservedBottom: number) {
  const frame = document.querySelector('.mobile-frame')
  const rect = frame?.getBoundingClientRect()
  const width = rect?.width || window.innerWidth
  const height = rect?.height || window.innerHeight

  return {
    maxX: Math.max(edgePadding, width - fabWidth - edgePadding),
    maxY: Math.max(edgePadding, height - fabHeight - edgePadding - reservedBottom),
  }
}

function normalizePosition(position: Point, reservedBottom: number) {
  const bounds = getBounds(reservedBottom)
  return {
    x: clamp(position.x, edgePadding, bounds.maxX),
    y: clamp(position.y, edgePadding, bounds.maxY),
  }
}

export function DraggablePageActionFab({
  actionId,
  label,
  icon: Icon,
  onClick,
  reservedBottom = 0,
}: DraggablePageActionFabProps) {
  const storageKey = `kxb-page-action-fab-${actionId}`
  const [position, setPosition] = useState<Point | null>(null)
  const dragStateRef = useRef<{ pointerId: number; originPointer: Point; originPosition: Point; moved: boolean } | null>(null)

  useEffect(() => {
    const getInitialPosition = () => {
      const saved = window.localStorage.getItem(storageKey)
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as Point
          if (Number.isFinite(parsed.x) && Number.isFinite(parsed.y)) {
            return normalizePosition(parsed, reservedBottom)
          }
        } catch {
          window.localStorage.removeItem(storageKey)
        }
      }

      const bounds = getBounds(reservedBottom)
      return { x: bounds.maxX, y: bounds.maxY }
    }

    setPosition(getInitialPosition())
    const handleResize = () => setPosition(current => current ? normalizePosition(current, reservedBottom) : getInitialPosition())
    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
    }
  }, [reservedBottom, storageKey])

  useEffect(() => {
    if (position) window.localStorage.setItem(storageKey, JSON.stringify(position))
  }, [position, storageKey])

  if (!position) return null

  return (
    <div className="pointer-events-none absolute inset-0 z-[45]">
      <button
        type="button"
        title={label}
        aria-label={label}
        className="pointer-events-auto absolute flex h-14 min-w-[116px] touch-none select-none items-center justify-center gap-1.5 rounded-full institution-btn-primary px-4 shadow-[0_10px_24px_-10px_rgba(14,112,192,0.58)] transition-transform active:scale-95"
        style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)` }}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId)
          dragStateRef.current = {
            pointerId: event.pointerId,
            originPointer: { x: event.clientX, y: event.clientY },
            originPosition: position,
            moved: false,
          }
        }}
        onPointerMove={(event) => {
          const dragState = dragStateRef.current
          if (!dragState || dragState.pointerId !== event.pointerId) return
          const deltaX = event.clientX - dragState.originPointer.x
          const deltaY = event.clientY - dragState.originPointer.y
          if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) dragState.moved = true
          setPosition(normalizePosition({ x: dragState.originPosition.x + deltaX, y: dragState.originPosition.y + deltaY }, reservedBottom))
        }}
        onPointerUp={(event) => {
          const dragState = dragStateRef.current
          dragStateRef.current = null
          event.currentTarget.releasePointerCapture(event.pointerId)
          if (!dragState?.moved) onClick()
        }}
        onPointerCancel={(event) => {
          dragStateRef.current = null
          event.currentTarget.releasePointerCapture(event.pointerId)
        }}
      >
        <Icon className="h-5 w-5 shrink-0" />
        <span className="whitespace-nowrap text-sm font-semibold leading-none">{label}</span>
      </button>
    </div>
  )
}
