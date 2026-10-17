'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import gsap from 'gsap'
import { reducedMotion } from '@/components/smooth-scroll'

export function PageRise({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = ref.current
    if (!root || reducedMotion()) return
    const nodes = root.querySelectorAll<HTMLElement>('[data-rise]')
    if (nodes.length === 0) return
    const tween = gsap.fromTo(
      nodes,
      { autoAlpha: 0, y: 16 },
      { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.05, clearProps: 'transform,opacity,visibility' },
    )
    return () => {
      tween.kill()
    }
  }, [])

  return <div ref={ref}>{children}</div>
}
