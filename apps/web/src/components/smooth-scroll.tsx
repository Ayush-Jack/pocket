'use client'

import { useEffect, type ReactNode } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

gsap.registerPlugin(ScrollTrigger)

export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (reducedMotion()) return

    const lenis = new Lenis({
      autoRaf: false,
      duration: 1.05,
      smoothWheel: true,
      lerp: 0.09,
    })

    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
    }
  }, [])

  return children
}

export function riseIn(target: Element | null) {
  if (!target || reducedMotion()) return
  gsap.fromTo(
    target,
    { autoAlpha: 0, y: 14, scale: 0.98 },
    { autoAlpha: 1, y: 0, scale: 1, duration: 0.45, ease: 'power3.out', clearProps: 'transform,opacity,visibility' },
  )
}

export function reducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
