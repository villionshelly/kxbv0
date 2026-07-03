'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Sparkles } from 'lucide-react'

type Point = {
  x: number
  y: number
}

const fabSize = 72
const edgePadding = 12
const storageKey = 'kxb-parent-ai-assistant-position'

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function getBounds() {
  const frame = document.querySelector('.mobile-frame')
  const rect = frame?.getBoundingClientRect()
  const width = rect?.width || window.innerWidth
  const height = rect?.height || window.innerHeight

  return {
    maxX: Math.max(edgePadding, width - fabSize - edgePadding),
    maxY: Math.max(edgePadding, height - fabSize - edgePadding),
  }
}

function normalizePosition(position: Point) {
  const bounds = getBounds()

  return {
    x: clamp(position.x, edgePadding, bounds.maxX),
    y: clamp(position.y, edgePadding, bounds.maxY),
  }
}

function getInitialPosition() {
  const bounds = getBounds()
  const saved = window.localStorage.getItem(storageKey)

  if (saved) {
    try {
      const parsed = JSON.parse(saved) as Point
      if (Number.isFinite(parsed.x) && Number.isFinite(parsed.y)) {
        return normalizePosition(parsed)
      }
    } catch {
      window.localStorage.removeItem(storageKey)
    }
  }

  return {
    x: bounds.maxX,
    y: Math.max(edgePadding, bounds.maxY - 16),
  }
}

export function ParentAiAssistantFab() {
  const router = useRouter()
  const pathname = usePathname()
  const [position, setPosition] = useState<Point | null>(null)
  const dragStateRef = useRef<{
    pointerId: number
    originPointer: Point
    originPosition: Point
    moved: boolean
  } | null>(null)

  const hidden = pathname.startsWith('/parent/assistant')

  useEffect(() => {
    if (hidden) return

    setPosition(getInitialPosition())

    const handleResize = () => {
      setPosition((current) => (current ? normalizePosition(current) : getInitialPosition()))
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
    }
  }, [hidden])

  useEffect(() => {
    if (!position || hidden) return
    window.localStorage.setItem(storageKey, JSON.stringify(position))
  }, [hidden, position])

  if (hidden || !position) {
    return null
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-[80]">
      <button
        type="button"
        aria-label="打开 AI 助理"
        className="pointer-events-auto absolute flex h-[72px] w-[72px] touch-none select-none items-center justify-center rounded-full transition-transform active:scale-95"
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        }}
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
          if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
            dragState.moved = true
          }

          setPosition(
            normalizePosition({
              x: dragState.originPosition.x + deltaX,
              y: dragState.originPosition.y + deltaY,
            }),
          )
        }}
        onPointerUp={(event) => {
          const dragState = dragStateRef.current
          dragStateRef.current = null
          event.currentTarget.releasePointerCapture(event.pointerId)

          if (!dragState?.moved) {
            router.push('/parent/assistant')
          }
        }}
        onPointerCancel={(event) => {
          dragStateRef.current = null
          event.currentTarget.releasePointerCapture(event.pointerId)
        }}
      >
        <span className="absolute -top-1 right-0 flex items-center gap-0.5 rounded-full rounded-bl-none bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground shadow">
          <Sparkles className="h-2.5 w-2.5" />
          AI助理
        </span>
        <span className="absolute inset-2 rounded-full bg-primary/10 blur-md" />
        <img
          src="/images/ai-crab.gif"
          alt="AI 助理"
          draggable={false}
          className="relative h-16 w-16 drop-shadow-[0_10px_14px_rgba(248,126,49,0.28)]"
        />
      </button>
    </div>
  )
}
