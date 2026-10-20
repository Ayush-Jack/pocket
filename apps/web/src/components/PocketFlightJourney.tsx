'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { PaperAirplane, type PaperAirplaneHandle } from '@/components/PaperAirplane'

gsap.registerPlugin(ScrollTrigger)

type Point = { x: number; y: number }

export function PocketFolder() {
  const triggerManualBounce = (el: HTMLElement) => {
    const bounce = el.querySelector<SVGGElement>('[data-flight-bounce]')
    const flap = el.querySelector<SVGGElement>('[data-flight-flap]')
    if (!bounce || !flap) return
    gsap.fromTo(
      bounce,
      { scaleX: 1.07, scaleY: 0.93 },
      { scaleX: 1, scaleY: 1, duration: 0.55, ease: 'elastic.out(1.1, 0.4)' },
    )
    gsap.fromTo(
      flap,
      { rotation: -38 },
      { rotation: 0, duration: 0.65, ease: 'elastic.out(1, 0.5)' },
    )
  }

  return (
    <div
      data-flight-folder=""
      onClick={(e) => triggerManualBounce(e.currentTarget)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          triggerManualBounce(e.currentTarget)
        }
      }}
      aria-label="Pocket landing folder"
      className="land-well clay-card-alive group mx-auto flex w-full max-w-[19rem] flex-col items-center p-5"
    >
      <div className="mb-1 flex w-full items-center justify-between font-[family-name:var(--font-mono)] text-[10px] text-[var(--muted)]">
        <span>POCKET DROP ZONE</span>
        <span className="clay-pill bg-[var(--clay)] px-2 py-0.5 text-[10px] text-[var(--ink)] group-hover:bg-[var(--accent)]">
          Tap to pulse
        </span>
      </div>
      <svg viewBox="0 0 240 230" className="w-full overflow-visible" fill="none" aria-hidden="true">
        <defs>
          <clipPath id="slot-clip-0">
            <rect x="48" y="110" width="44" height="54" rx="10" />
          </clipPath>
          <clipPath id="slot-clip-1">
            <rect x="98" y="106" width="44" height="54" rx="10" />
          </clipPath>
          <clipPath id="slot-clip-2">
            <rect x="148" y="110" width="44" height="54" rx="10" />
          </clipPath>
        </defs>
        <ellipse cx="120" cy="208" rx="78" ry="12" fill="#d5e0ee" opacity="0.75" />
        <g data-flight-bounce="" className="journey-bounce">
          <rect x="22" y="58" width="196" height="146" rx="36" fill="#e7e4f8" />
          <g data-flight-flap="" className="journey-flap">
            <path d="M36 92c22-46 62-62 84-64 24-2 62 14 86 64v16c-28-34-62-44-86-42-26 2-62 18-84 42V92Z" fill="#d9e0ff" />
          </g>
          <rect x="36" y="100" width="168" height="92" rx="28" fill="#f6f8fc" />
          <g clipPath="url(#slot-clip-0)">
            <image
              href="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=240&q=75"
              x="48"
              y="110"
              width="44"
              height="54"
              preserveAspectRatio="xMidYMid slice"
            />
          </g>
          <g clipPath="url(#slot-clip-1)">
            <image
              href="https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=240&q=75"
              x="98"
              y="106"
              width="44"
              height="54"
              preserveAspectRatio="xMidYMid slice"
            />
          </g>
          <g clipPath="url(#slot-clip-2)">
            <image
              href="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=240&q=75"
              x="148"
              y="110"
              width="44"
              height="54"
              preserveAspectRatio="xMidYMid slice"
            />
          </g>
        </g>
      </svg>
    </div>
  )
}

export function PocketFlightJourney() {
  const planeRef = useRef<HTMLDivElement>(null)
  const airRef = useRef<PaperAirplaneHandle>(null)

  useEffect(() => {
    const plane = planeRef.current
    const start = document.querySelector<HTMLElement>('[data-flight-start]')
    const works = document.querySelector<HTMLElement>('[data-flight-works]')
    const features = document.querySelector<HTMLElement>('[data-flight-features]')
    const folder = document.querySelector<HTMLElement>('[data-flight-folder]')
    const flap = folder?.querySelector<SVGGElement>('[data-flight-flap]')
    const bounce = folder?.querySelector<SVGGElement>('[data-flight-bounce]')
    const docs = plane ? [...plane.querySelectorAll<SVGGElement>('[data-doc]')] : []
    const slots = folder ? [...folder.querySelectorAll<SVGGElement>('[data-flight-slot]')] : []
    if (!plane || !start || !works || !features || !folder || !flap || !bounce) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let points: Point[] = []
    let bank = 0
    let lastAngle = 0
    let seeded = false

    const measure = () => {
      points = buildPath(start, works, features, folder)
    }

    const apply = (progress: number) => {
      if (points.length < 2) return
      const along = pointOn(points, progress)
      const arrive = clamp((progress - 0.72) / 0.28)
      const sink = clamp((arrive - 0.55) / 0.35)
      const width = plane.offsetWidth || 120
      const height = plane.offsetHeight || 150
      plane.style.visibility = 'visible'
      plane.style.opacity = String(1 - sink)
      plane.style.transform = `translate(${along.x - window.scrollX - width / 2}px, ${along.y - window.scrollY - height * 0.42}px) rotate(${along.angle}deg) scale(${1 - sink * 0.82})`
      if (!reduced) {
        if (!seeded) {
          lastAngle = along.angle
          seeded = true
        } else {
          const targetBank = Math.min(16, Math.max(-16, (along.angle - lastAngle) * 1.6))
          bank += (targetBank - bank) * 0.28
          lastAngle = along.angle
        }
        airRef.current?.setFlight({ bank })
      }

      docs.forEach((doc, index) => {
        const begin = 0.12 + index * 0.16
        const local = clamp((arrive - begin) / 0.14)
        const slot = slots[index]
        if (local <= 0) {
          if (doc.dataset.detached === '1') {
            doc.style.removeProperty('transform')
            doc.style.removeProperty('opacity')
            delete doc.dataset.detached
          }
          if (slot) slot.style.opacity = '0'
          return
        }
        doc.dataset.detached = '1'
        doc.style.transform = `translate(${local * 28}px, ${local * 54}px) scale(${1 - local * 0.35})`
        doc.style.opacity = String(1 - local)
        if (slot) slot.style.opacity = String(local)
      })

      let flapAngle = 0
      if (arrive < 0.18) flapAngle = -52 * (arrive / 0.18)
      else if (arrive < 0.8) flapAngle = -52
      else {
        const close = (arrive - 0.8) / 0.2
        flapAngle = -52 * (1 - close) + Math.sin(close * Math.PI) * (1 - close) * 10
      }
      flap.style.transform = `rotate(${flapAngle}deg)`
      const bounceAmount = arrive > 0.8 ? Math.sin(((arrive - 0.8) / 0.2) * Math.PI) * 0.05 : 0
      bounce.style.transform = `scale(${1 + bounceAmount}, ${1 - bounceAmount * 0.6})`
    }

    measure()
    if (reduced) {
      apply(0)
      flap.style.transform = 'rotate(-32deg)'
      return () => {
        plane.style.visibility = 'hidden'
      }
    }

    const trigger = ScrollTrigger.create({
      trigger: start,
      start: 'center center',
      endTrigger: folder,
      end: 'center center',
      scrub: 0.45,
      invalidateOnRefresh: true,
      onRefresh: measure,
      onUpdate: (self) => apply(self.progress),
    })
    apply(trigger.progress)

    const onResize = () => ScrollTrigger.refresh()
    window.addEventListener('resize', onResize)
    let resizeTimer = 0
    const bodyObserver = new ResizeObserver(() => {
      window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(() => ScrollTrigger.refresh(), 90)
    })
    bodyObserver.observe(document.body)
    return () => {
      window.clearTimeout(resizeTimer)
      bodyObserver.disconnect()
      window.removeEventListener('resize', onResize)
      trigger.kill()
    }
  }, [])

  return (
    <div ref={planeRef} className="journey-plane pointer-events-none fixed left-0 top-0 z-20 w-40 sm:w-48" style={{ visibility: 'hidden' }} aria-hidden="true">
      <div className="journey-glide relative aspect-[5/6] w-full">
        <PaperAirplane ref={airRef} className="absolute inset-x-0 top-0 h-[68%] w-full" />
        <svg className="pointer-events-none absolute h-0 w-0 overflow-hidden" aria-hidden="true">
          <g data-doc="0" />
          <g data-doc="1" />
          <g data-doc="2" />
        </svg>
      </div>
    </div>
  )
}

function buildPath(start: HTMLElement, works: HTMLElement, features: HTMLElement, folder: HTMLElement): Point[] {
  const narrow = window.innerWidth < 1024
  const begin = documentPoint(start)
  const end = documentPoint(folder)
  const worksBox = works.getBoundingClientRect()
  const featureBox = features.getBoundingClientRect()
  const half = narrow ? 52 : 68
  const left = window.scrollX + half + 8
  const right = window.scrollX + window.innerWidth - half - 8
  const yOf = (box: DOMRect, ratio: number) => box.top + box.height * ratio + window.scrollY
  if (narrow) {
    return [
      begin,
      { x: right, y: yOf(worksBox, 0.35) },
      { x: right, y: yOf(featureBox, 0.55) },
      { x: end.x, y: end.y - 80 },
      end,
    ]
  }
  return [
    begin,
    { x: right, y: yOf(worksBox, 0.42) },
    { x: left, y: yOf(featureBox, 0.5) },
    { x: end.x - 40, y: end.y - 70 },
    end,
  ]
}

function documentPoint(element: HTMLElement): Point {
  const box = element.getBoundingClientRect()
  return {
    x: box.left + box.width / 2 + window.scrollX,
    y: box.top + box.height / 2 + window.scrollY,
  }
}

function pointOn(points: Point[], t: number): Point & { angle: number } {
  const current = catmull(points, t)
  const next = catmull(points, Math.min(1, t + 0.02))
  return {
    ...current,
    angle: Math.atan2(next.y - current.y, next.x - current.x) * (180 / Math.PI),
  }
}

function catmull(points: Point[], t: number): Point {
  const last = points.length - 1
  if (last <= 0) return points[0]
  const scaled = Math.min(last, Math.max(0, t * last))
  const index = Math.min(last - 1, Math.floor(scaled))
  const u = scaled - index
  const p0 = points[Math.max(0, index - 1)]
  const p1 = points[index]
  const p2 = points[Math.min(last, index + 1)]
  const p3 = points[Math.min(last, index + 2)]
  const u2 = u * u
  const u3 = u2 * u
  return {
    x: 0.5 * (2 * p1.x + (-p0.x + p2.x) * u + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * u2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * u3),
    y: 0.5 * (2 * p1.y + (-p0.y + p2.y) * u + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * u2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * u3),
  }
}

function clamp(value: number): number {
  return Math.min(1, Math.max(0, value))
}
