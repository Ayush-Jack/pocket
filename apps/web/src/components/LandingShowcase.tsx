'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Logo } from '@/components/logo'

gsap.registerPlugin(ScrollTrigger)

type ShowcaseFile = {
  id: string
  name: string
  category: 'Travel' | 'Food' | 'Nature' | 'Architecture' | 'Cinema' | 'Docs'
  sizeLabel: string
  sizeBytes: number
  kind: 'photo' | 'video' | 'document'
  mime: string
  msgId: number
  imageUrl: string
  duration?: string
  pages?: number
}

const INITIAL_SHOWCASE_FILES: ShowcaseFile[] = [
  {
    id: 'f-1',
    name: 'kyoto-bamboo-morning.jpg',
    category: 'Travel',
    sizeLabel: '18.4 MB',
    sizeBytes: 18_400_000,
    kind: 'photo',
    mime: 'image/jpeg',
    msgId: 4812,
    imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'f-2',
    name: 'artisan-ramen-tokyo.jpg',
    category: 'Food',
    sizeLabel: '12.8 MB',
    sizeBytes: 12_800_000,
    kind: 'photo',
    mime: 'image/jpeg',
    msgId: 4815,
    imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'f-3',
    name: 'dolomites-ridge-fpv.mp4',
    category: 'Travel',
    sizeLabel: '412.0 MB',
    sizeBytes: 412_000_000,
    kind: 'video',
    mime: 'video/mp4',
    msgId: 4819,
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80',
    duration: '01:48',
  },
  {
    id: 'f-4',
    name: 'sourdough-croissant-bake.jpg',
    category: 'Food',
    sizeLabel: '9.6 MB',
    sizeBytes: 9_600_000,
    kind: 'photo',
    mime: 'image/jpeg',
    msgId: 4823,
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'f-5',
    name: 'amalfi-coast-sunset-cut.mov',
    category: 'Cinema',
    sizeLabel: '1.18 GB',
    sizeBytes: 1_180_000_000,
    kind: 'video',
    mime: 'video/quicktime',
    msgId: 4827,
    imageUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=900&q=80',
    duration: '03:12',
  },
  {
    id: 'f-6',
    name: 'nordic-architecture-zine.pdf',
    category: 'Architecture',
    sizeLabel: '14.2 MB',
    sizeBytes: 14_200_000,
    kind: 'document',
    mime: 'application/pdf',
    msgId: 4831,
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=900&q=80',
    pages: 24,
  },
]

const SAMPLE_PRESETS: ShowcaseFile[] = [
  {
    id: 'preset-food',
    name: 'neapolitan-woodfire-pizza.jpg',
    category: 'Food',
    sizeLabel: '16.4 MB',
    sizeBytes: 16_400_000,
    kind: 'photo',
    mime: 'image/jpeg',
    msgId: 4890,
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'preset-travel',
    name: 'swiss-alps-glacier-express.mp4',
    category: 'Travel',
    sizeLabel: '684.0 MB',
    sizeBytes: 684_000_000,
    kind: 'video',
    mime: 'video/mp4',
    msgId: 4894,
    imageUrl: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=900&q=80',
    duration: '00:54',
  },
  {
    id: 'preset-doc',
    name: 'tokyo-itinerary-guide-2026.pdf',
    category: 'Docs',
    sizeLabel: '5.8 MB',
    sizeBytes: 5_800_000,
    kind: 'document',
    mime: 'application/pdf',
    msgId: 4899,
    imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=900&q=80',
    pages: 16,
  },
]

export function LandingChoreography() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-hero-reveal]',
        { y: 28, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.85,
          stagger: 0.08,
          ease: 'power3.out',
          clearProps: 'transform,opacity,visibility',
        },
      )

      const sections = gsap.utils.toArray<HTMLElement>('[data-section-reveal]')
      sections.forEach((section) => {
        const items = section.querySelectorAll<HTMLElement>('[data-reveal-item]')
        const targets = items.length > 0 ? items : [section]
        gsap.fromTo(
          targets,
          { y: 32, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.78,
            stagger: 0.08,
            ease: 'power3.out',
            clearProps: 'transform,opacity,visibility',
            scrollTrigger: {
              trigger: section,
              start: 'top 82%',
              toggleActions: 'play none none none',
            },
          },
        )
      })
    })

    const tiltCards = Array.from(document.querySelectorAll<HTMLElement>('[data-tilt]'))
    const cleanupTilt = tiltCards.map((card) => {
      const strength = Number(card.dataset.tilt || '5')
      const onMove = (event: PointerEvent) => {
        if (event.pointerType === 'touch') return
        const rect = card.getBoundingClientRect()
        const px = (event.clientX - rect.left) / rect.width
        const py = (event.clientY - rect.top) / rect.height
        const rx = (0.5 - py) * strength
        const ry = (px - 0.5) * strength
        card.style.setProperty('--spot-x', `${(px * 100).toFixed(1)}%`)
        card.style.setProperty('--spot-y', `${(py * 100).toFixed(1)}%`)
        card.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(-3px)`
      }
      const onLeave = () => {
        card.style.transform = ''
      }
      card.addEventListener('pointermove', onMove)
      card.addEventListener('pointerleave', onLeave)
      return () => {
        card.removeEventListener('pointermove', onMove)
        card.removeEventListener('pointerleave', onLeave)
      }
    })

    const magnets = Array.from(document.querySelectorAll<HTMLElement>('[data-magnetic]'))
    const cleanupMagnets = magnets.map((el) => {
      const onMove = (event: PointerEvent) => {
        if (event.pointerType === 'touch') return
        const rect = el.getBoundingClientRect()
        const dx = (event.clientX - (rect.left + rect.width / 2)) * 0.18
        const dy = (event.clientY - (rect.top + rect.height / 2)) * 0.24
        el.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`
      }
      const onLeave = () => {
        el.style.transform = ''
      }
      el.addEventListener('pointermove', onMove)
      el.addEventListener('pointerleave', onLeave)
      return () => {
        el.removeEventListener('pointermove', onMove)
        el.removeEventListener('pointerleave', onLeave)
      }
    })

    return () => {
      ctx.revert()
      cleanupTilt.forEach((fn) => fn())
      cleanupMagnets.forEach((fn) => fn())
    }
  }, [])

  return null
}

const POCKET_FOLDER_ITEMS = [
  {
    id: 'photos',
    label: 'Photos',
    ext: 'JPG',
    name: 'Kyoto_Trip.jpg',
    size: '18 MB',
    tag: 'Photos',
    status: 'Saved Messages · Photos',
    sheetBg: 'linear-gradient(155deg, #ffffff 0%, #f3f0ff 55%, #e5dffb 100%)',
    badgeBg: '#e7e4f8',
    accent: '#6c56cf',
    fanX: -40,
    fanY: -36,
    fanRot: -8,
    idleX: -26,
    idleY: -12,
    idleRot: -4,
  },
  {
    id: 'docs',
    label: 'Documents',
    ext: 'PDF',
    name: 'Project_Notes.pdf',
    size: '14 MB',
    tag: 'Documents',
    status: 'Saved Messages · Documents',
    sheetBg: 'linear-gradient(155deg, #ffffff 0%, #eef3ff 55%, #dce5ff 100%)',
    badgeBg: '#d9e0ff',
    accent: '#4a62d8',
    fanX: 0,
    fanY: -48,
    fanRot: 0,
    idleX: 0,
    idleY: -22,
    idleRot: 0,
  },
  {
    id: 'videos',
    label: 'Videos',
    ext: 'MP4',
    name: 'Mountain_Reel.mp4',
    size: '412 MB',
    tag: 'Videos',
    status: 'Saved Messages · Videos',
    sheetBg: 'linear-gradient(155deg, #ffffff 0%, #ebf9f3 55%, #d6f0e5 100%)',
    badgeBg: '#ddefe8',
    accent: '#2e8b67',
    fanX: 40,
    fanY: -36,
    fanRot: 8,
    idleX: 26,
    idleY: -12,
    idleRot: 4,
  },
] as const

export function HeroFileObject() {
  const [activeIdx, setActiveIdx] = useState(1)
  const [folderOpen, setFolderOpen] = useState(false)
  const [hovered, setHovered] = useState(false)
  const stageRef = useRef<HTMLDivElement>(null)
  const targetRef = useRef({ x: 0, y: 0 })

  const activeItem = POCKET_FOLDER_ITEMS[activeIdx]
  const isExpanded = folderOpen || hovered

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const spring = { x: 0, y: 0, vx: 0, vy: 0 }
    let raf = 0
    let last = performance.now()

    const tick = (now: number) => {
      const dt = Math.min(0.032, Math.max(0.001, (now - last) / 1000))
      last = now
      const sub = dt / 2
      for (let i = 0; i < 2; i += 1) {
        const ax = -120 * (spring.x - targetRef.current.x) - 18 * spring.vx
        spring.vx += ax * sub
        spring.x += spring.vx * sub

        const ay = -120 * (spring.y - targetRef.current.y) - 18 * spring.vy
        spring.vy += ay * sub
        spring.y += spring.vy * sub
      }

      const rx = -spring.y * 15
      const ry = spring.x * 18
      stage.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`
      raf = window.requestAnimationFrame(tick)
    }

    raf = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(raf)
  }, [])

  return (
    <div
      data-hero-reveal=""
      className="relative mx-auto flex w-full max-w-[336px] flex-col items-center select-none py-2 sm:max-w-[390px] lg:max-w-[420px]"
      style={{ perspective: '1200px' }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        targetRef.current = {
          x: (e.clientX - rect.left) / rect.width - 0.5,
          y: (e.clientY - rect.top) / rect.height - 0.5,
        }
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false)
        targetRef.current = { x: 0, y: 0 }
      }}
    >
      {/* Soft Pastel Clay Glow Behind the Folder */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-4 -z-10 rounded-full blur-3xl transition-all duration-500"
        style={{
          background:
            'radial-gradient(circle at 50% 52%, rgba(128, 152, 248, 0.52) 0%, rgba(217, 224, 255, 0.35) 52%, transparent 74%)',
        }}
      />

      {/* 3D Sculpted Clay Folder Stage */}
      <div
        ref={stageRef}
        className="relative h-[286px] w-full sm:h-[320px]"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* 1. BACK CLAY FOLDER BODY + MOLDED TOP-LEFT FOLDER TAB */}
        <div
          className="absolute inset-x-3 bottom-3 top-12 rounded-[32px] sm:inset-x-4 sm:rounded-[36px]"
          style={{
            transform: 'translateZ(-24px)',
            background: 'linear-gradient(155deg, #9bb2f8 0%, #7d97ee 55%, #6682e3 100%)',
            border: '2px solid rgba(255, 255, 255, 0.65)',
            boxShadow:
              '-12px -12px 26px rgba(255, 255, 255, 0.9), 22px 28px 46px rgba(112, 134, 180, 0.55), inset 4px 5px 12px rgba(255, 255, 255, 0.65), inset -6px -8px 16px rgba(68, 92, 178, 0.48)',
          }}
        >
          {/* Sculpted Folder Tab rising on top-left */}
          <div
            className="absolute -top-7 left-4 flex h-9 w-36 items-center gap-2 rounded-t-[18px] px-3.5 sm:left-5 sm:h-10 sm:w-40 sm:rounded-t-[20px] sm:px-4"
            style={{
              background: 'linear-gradient(180deg, #a7bcfb 0%, #8ca5f3 100%)',
              borderTop: '2px solid rgba(255, 255, 255, 0.78)',
              borderLeft: '2px solid rgba(255, 255, 255, 0.7)',
              borderRight: '2px solid rgba(255, 255, 255, 0.55)',
              boxShadow: 'inset 2px 3px 6px rgba(255, 255, 255, 0.65)',
            }}
          >
            <span className="h-2 w-2 rounded-full bg-white shadow-2xs" />
            <span className="font-[family-name:var(--font-mono)] text-[9px] font-semibold tracking-[0.14em] text-white sm:text-[10px]">
              POCKET DRIVE
            </span>
          </div>

          {/* Recessed Dark-Blue Inner Pocket Cavity */}
          <div
            className="absolute inset-x-3 top-3 bottom-12 rounded-[24px] sm:inset-x-3.5 sm:top-3.5 sm:rounded-[28px]"
            style={{
              background: 'linear-gradient(180deg, #5c76d6 0%, #718be3 100%)',
              boxShadow:
                'inset 6px 8px 16px rgba(42, 60, 132, 0.58), inset -4px -4px 10px rgba(175, 195, 255, 0.35)',
            }}
          />
        </div>

        {/* 2. SCULPTED 3D CLAY FILE SHEETS TUCKED INSIDE THE FOLDER */}
        {POCKET_FOLDER_ITEMS.map((item, idx) => {
          const isSelected = idx === activeIdx
          const tx = isSelected ? 0 : isExpanded ? item.fanX : item.idleX
          const ty = isSelected ? -36 : isExpanded ? item.fanY + 12 : item.idleY + 14
          const tz = isSelected ? 22 : idx === 1 ? 4 : -6
          const rot = isSelected ? 0 : isExpanded ? item.fanRot : item.idleRot
          const scale = isSelected ? 1.0 : isExpanded ? 0.91 : 0.86

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setActiveIdx(idx)
                setFolderOpen(true)
              }}
              aria-label={`Select ${item.label} file ${item.name}`}
              className="absolute left-1/2 top-11 w-[176px] -translate-x-1/2 overflow-hidden rounded-[24px] p-3 text-left transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:w-[214px] sm:rounded-[26px] sm:p-3.5"
              style={{
                background: item.sheetBg,
                border: '2px solid rgba(255, 255, 255, 0.96)',
                transform: `translate3d(${tx}px, ${ty}px, ${tz}px) rotateZ(${rot}deg) scale(${scale})`,
                zIndex: isSelected ? 25 : 14 + idx,
                boxShadow: isSelected
                  ? '-8px -8px 18px rgba(255, 255, 255, 0.96), 12px 18px 30px rgba(56, 74, 132, 0.34), inset 3px 3px 7px rgba(255, 255, 255, 0.98), inset -3px -4px 9px rgba(178, 194, 224, 0.45)'
                  : '-4px -4px 10px rgba(255, 255, 255, 0.85), 8px 12px 22px rgba(56, 74, 132, 0.24), inset 2px 2px 5px rgba(255, 255, 255, 0.9)',
              }}
            >
              {/* Top Row: Molded 3D Clay File Type Icon + Extension Pill */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl font-[family-name:var(--font-mono)] text-[9px] font-bold text-white shadow-xs sm:h-8 sm:w-8 sm:text-[10px]"
                    style={{
                      background: item.accent,
                      boxShadow: 'inset 1.5px 1.5px 3px rgba(255,255,255,0.45)',
                    }}
                  >
                    {item.ext}
                  </span>
                  <div
                    className={`min-w-0 transition-opacity duration-300 ${
                      isSelected ? 'opacity-100' : 'opacity-0 sm:opacity-75'
                    }`}
                  >
                    <p className="truncate font-[family-name:var(--font-display)] text-[11px] font-semibold text-[var(--ink)] sm:text-xs">
                      {item.name}
                    </p>
                    <p className="font-[family-name:var(--font-mono)] text-[10px] text-[var(--muted)]">
                      {item.size}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tactile Molded Clay Lines on the Document Sheet */}
              <div className="mt-2.5 space-y-1.5 rounded-2xl bg-white/70 p-2 shadow-inner sm:mt-3 sm:p-2.5">
                <div className="flex items-center justify-between gap-1">
                  <span
                    className="h-2 w-12 rounded-full sm:w-16"
                    style={{ background: item.badgeBg }}
                  />
                  <span
                    className={`truncate font-[family-name:var(--font-mono)] text-[9px] font-semibold text-[var(--muted)] transition-opacity duration-300 ${
                      isSelected ? 'opacity-100' : 'opacity-0 sm:opacity-70'
                    }`}
                  >
                    {item.tag}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-[var(--field)]" />
                <div className="h-1.5 w-3/4 rounded-full bg-[var(--field)]" />
              </div>
            </button>
          )
        })}

        {/* 3. SCULPTED FRONT CLAY POCKET POUCH / FOLDER FLAP */}
        <div
          onClick={() => setFolderOpen((v) => !v)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setFolderOpen((v) => !v)
            }
          }}
          aria-label="Open or close Pocket folder"
          className="absolute inset-x-1.5 bottom-2 h-[170px] cursor-pointer rounded-[32px] p-3.5 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:inset-x-2 sm:h-[186px] sm:rounded-[36px] sm:p-5"
          style={{
            transformOrigin: '50% 100%',
            transform: isExpanded
              ? 'translateZ(46px) rotateX(-18deg)'
              : 'translateZ(40px) rotateX(-5deg)',
            background:
              'linear-gradient(160deg, #b8cbff 0%, #98b2fc 48%, #7b98f4 100%)',
            border: '2px solid rgba(255, 255, 255, 0.86)',
            boxShadow:
              '-8px -8px 20px rgba(255, 255, 255, 0.85), 16px 24px 38px rgba(86, 108, 168, 0.52), inset 4px 6px 12px rgba(255, 255, 255, 0.82), inset -6px -8px 16px rgba(66, 88, 172, 0.45)',
            zIndex: 30,
          }}
        >
          {/* Sculpted Top Pocket Scoop / Lip Indent */}
          <div
            aria-hidden="true"
            className="mx-auto -mt-0.5 mb-2.5 h-2 w-20 rounded-full sm:mb-3 sm:h-2.5 sm:w-24"
            style={{
              background: 'rgba(72, 95, 180, 0.32)',
              boxShadow:
                'inset 1px 2px 4px rgba(45, 64, 138, 0.45), 0 1.5px 0 rgba(255, 255, 255, 0.78)',
            }}
          />

          <div className="flex h-[calc(100%-1.1rem)] flex-col justify-between">
            {/* Center Folder Identity: 3D White Clay Paper Plane + Active File Status */}
            <div className="flex items-center justify-between gap-2 sm:gap-3">
              <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3">
                {/* 3D White Clay Paper-Plane Badge (matching Pocket Logo) */}
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl sm:h-12 sm:w-12"
                  style={{
                    background: 'linear-gradient(145deg, #ffffff 0%, #eef2ff 100%)',
                    boxShadow:
                      '-3px -3px 8px rgba(255, 255, 255, 0.9), 6px 8px 16px rgba(58, 78, 152, 0.38), inset 2px 2px 4px rgba(255, 255, 255, 0.95), inset -2px -2px 5px rgba(178, 194, 232, 0.5)',
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-5 w-5 text-[#4d63dc] sm:h-6 sm:w-6"
                    aria-hidden="true"
                  >
                    <path
                      d="M21.2 4.4 2.9 11.5c-.8.3-.8 1.4 0 1.7l4.7 1.7 1.8 5.3c.3.8 1.3 1 1.9.3l2.7-3.1 4.6 3.4c.7.5 1.7.1 1.9-.8l2.2-14.3c.2-.9-.7-1.6-1.5-1.3Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-[family-name:var(--font-mono)] text-[8.5px] font-semibold uppercase tracking-[0.06em] text-white/85 sm:text-[10px] sm:tracking-[0.12em]">
                    {activeItem.status}
                  </p>
                  <p className="truncate font-[family-name:var(--font-display)] text-sm font-semibold leading-tight text-white drop-shadow-2xs sm:text-lg">
                    {activeItem.name}
                  </p>
                </div>
              </div>

              <span className="shrink-0 whitespace-nowrap rounded-full bg-white/90 px-2 py-0.5 font-[family-name:var(--font-mono)] text-[9.5px] font-bold text-[#3e4a5c] shadow-sm sm:px-3 sm:py-1 sm:text-[10px]">
                {activeItem.size}
              </span>
            </div>

            {/* Interactive Folder File-Type Tabs on the Front Flap */}
            <div
              className="flex items-center gap-1 rounded-2xl p-1 sm:gap-1.5 sm:p-1.5"
              style={{
                background: 'rgba(68, 90, 174, 0.28)',
                boxShadow:
                  'inset 3px 4px 8px rgba(45, 64, 138, 0.38), 0 1px 0 rgba(255, 255, 255, 0.45)',
              }}
              onClick={(e) => e.stopPropagation()}
              role="tablist"
              aria-label="Pocket folder categories"
            >
              {POCKET_FOLDER_ITEMS.map((item, idx) => {
                const active = idx === activeIdx
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => {
                      setActiveIdx(idx)
                      setFolderOpen(true)
                    }}
                    className={`flex-1 rounded-xl py-1.5 font-[family-name:var(--font-mono)] text-[9px] font-semibold uppercase tracking-[0.08em] transition-all sm:text-[10px] sm:tracking-[0.1em] ${
                      active
                        ? 'bg-white text-[#3e4a5c] shadow-sm'
                        : 'text-white/85 hover:bg-white/15 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function InteractiveDriveShowcase() {
  const [files, setFiles] = useState<ShowcaseFile[]>(INITIAL_SHOWCASE_FILES)
  const [activeView, setActiveView] = useState<'all' | 'photos' | 'videos' | 'documents'>('all')
  const [search, setSearch] = useState('')
  const [selectedFile, setSelectedFile] = useState<ShowcaseFile | null>(null)
  const [statusBanner, setStatusBanner] = useState<{ text: string; tone: 'neutral' | 'mint' | 'peach' }>({
    text: 'Interactive sandbox — switch views, queue a Food or Travel photo, or test the 2 GB stop before signing in.',
    tone: 'neutral',
  })
  const [uploadingName, setUploadingName] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  const filtered = files.filter((file) => {
    const viewMatch =
      activeView === 'all' ||
      (activeView === 'photos' && file.kind === 'photo') ||
      (activeView === 'videos' && file.kind === 'video') ||
      (activeView === 'documents' && file.kind === 'document')
    const q = search.trim().toLowerCase()
    const searchMatch =
      !q || file.name.toLowerCase().includes(q) || file.category.toLowerCase().includes(q)
    return viewMatch && searchMatch
  })

  useEffect(() => {
    if (!gridRef.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const cards = gridRef.current.querySelectorAll<HTMLElement>('[data-sandbox-card]')
    if (cards.length === 0) return
    gsap.fromTo(
      cards,
      { y: 14, autoAlpha: 0, scale: 0.98 },
      { y: 0, autoAlpha: 1, scale: 1, duration: 0.42, stagger: 0.04, ease: 'power3.out', overwrite: 'auto' },
    )
  }, [activeView, files.length])

  function queuePreset(preset: ShowcaseFile) {
    if (uploadingName) return
    const uniqueId = `${preset.id}-${Date.now()}`
    const item: ShowcaseFile = {
      ...preset,
      id: uniqueId,
      msgId: 4900 + Math.floor(Math.random() * 90),
    }
    setUploadingName(item.name)
    setUploadProgress(18)
    setStatusBanner({
      text: `Saving ${item.name} (1 of 1) into your Telegram Saved Messages…`,
      tone: 'neutral',
    })

    window.setTimeout(() => setUploadProgress(64), 220)
    window.setTimeout(() => setUploadProgress(100), 460)
    window.setTimeout(() => {
      setFiles((prev) => [item, ...prev])
      setUploadingName(null)
      setUploadProgress(0)
      setStatusBanner({
        text: `Saved ${item.name} in your account (Telegram msg #${item.msgId}).`,
        tone: 'mint',
      })
    }, 680)
  }

  function triggerOversizeStop() {
    if (uploadingName) return
    setStatusBanner({
      text: 'cinema-master-raw.mov (2.48 GB) is larger than 2 GB, so it never starts uploading.',
      tone: 'peach',
    })
  }

  function removeFile(target: ShowcaseFile) {
    setStatusBanner({
      text: `Deleting ${target.name} from Telegram Saved Messages (msg #${target.msgId}) first…`,
      tone: 'neutral',
    })
    window.setTimeout(() => {
      setFiles((prev) => prev.filter((item) => item.id !== target.id))
      if (selectedFile?.id === target.id) setSelectedFile(null)
      setStatusBanner({
        text: `Removed ${target.name} from Telegram and your Pocket list.`,
        tone: 'mint',
      })
    }, 320)
  }

  function simulateDownload(target: ShowcaseFile) {
    if (downloadingId) return
    setDownloadingId(target.id)
    setStatusBanner({
      text: `Streaming ${target.name} (${target.sizeLabel}) directly from Telegram…`,
      tone: 'mint',
    })
    window.setTimeout(() => {
      setDownloadingId(null)
      setStatusBanner({
        text: `Downloaded ${target.name} (${target.sizeLabel}) from Saved Messages.`,
        tone: 'mint',
      })
    }, 800)
  }

  const totalBytes = files.reduce((sum, f) => sum + f.sizeBytes, 0)
  const totalFormatted =
    totalBytes >= 1_000_000_000
      ? `${(totalBytes / 1_000_000_000).toFixed(2)} GB`
      : `${(totalBytes / 1_000_000_000).toFixed(1)} MB`

  return (
    <section
      id="showcase"
      data-section-reveal=""
      className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-8 sm:py-16"
    >
      <div data-reveal-item="" className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="font-[family-name:var(--font-mono)] text-xs tracking-[0.16em] text-[var(--muted)]">
            LIVE PRODUCT SANDBOX
          </p>
          <h2 className="mt-2.5 font-[family-name:var(--font-display)] text-3xl font-medium leading-none sm:text-5xl">
            Touch the drive right here.
          </h2>
        </div>
        {/* <p className="max-w-md text-sm text-[var(--muted)] sm:text-base">
          Every button below works. Filter views, send Food &amp; Travel files into the queue, inspect a photo card, or test the 2 GB guard.
        </p> */}
      </div>

      {/* Main Tactile Clay Drive Frame */}
      <div data-reveal-item="" className="land-well mt-7 p-3 sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[14.5rem_minmax(0,1fr)]">
          {/* Left Clay Sidebar Replica */}
          <aside className="clay flex flex-col justify-between gap-5 p-4">
            <div>
              <div className="flex items-center gap-3">
                <Logo className="h-9 w-9" />
                <div>
                  <p className="font-[family-name:var(--font-display)] text-base font-medium leading-tight">
                    Pocket
                  </p>
                  <p className="font-[family-name:var(--font-mono)] text-[11px] text-[var(--muted)]">
                    Saved Messages
                  </p>
                </div>
              </div>

              <nav className="mt-5 flex flex-wrap gap-1.5 lg:flex-col" aria-label="Sandbox views">
                {(
                  [
                    { id: 'all', label: 'All files', count: files.length },
                    { id: 'photos', label: 'Photos', count: files.filter((f) => f.kind === 'photo').length },
                    { id: 'videos', label: 'Videos', count: files.filter((f) => f.kind === 'video').length },
                    { id: 'documents', label: 'Documents', count: files.filter((f) => f.kind === 'document').length },
                  ] as const
                ).map((tab) => {
                  const active = activeView === tab.id
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveView(tab.id)}
                      className={`flex items-center justify-between gap-2 rounded-2xl px-3.5 py-2.5 text-left text-sm transition-all ${
                        active
                          ? 'clay-press bg-[var(--accent)] font-medium text-[var(--ink)]'
                          : 'bg-transparent text-[var(--muted)] hover:bg-[var(--field)]/70 hover:text-[var(--ink)]'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span className="rounded-full bg-[var(--clay)] px-2 py-0.5 font-[family-name:var(--font-mono)] text-[11px] text-[var(--ink)]">
                        {tab.count}
                      </span>
                    </button>
                  )
                })}
              </nav>
            </div>

            {/* Storage Readout inside Sidebar */}
            <div className="clay-well-sm p-3.5">
              <div className="flex items-center justify-between font-[family-name:var(--font-mono)] text-[11px] text-[var(--muted)]">
                <span>INDEXED IN POCKET</span>
                <span className="text-[var(--ink)]">{totalFormatted}</span>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-[var(--muted)]">
                Stored in your own Telegram Saved Messages. Zero external cloud buckets.
              </p>
              {files.length !== INITIAL_SHOWCASE_FILES.length ? (
                <button
                  type="button"
                  onClick={() => {
                    setFiles(INITIAL_SHOWCASE_FILES)
                    setSelectedFile(null)
                    setStatusBanner({
                      text: 'Sandbox reset to default Saved Messages list.',
                      tone: 'neutral',
                    })
                  }}
                  className="clay-pill mt-2.5 w-full justify-center bg-[var(--clay)] py-1.5 font-[family-name:var(--font-mono)] text-[11px]"
                >
                  Reset sandbox files
                </button>
              ) : null}
            </div>
          </aside>

          {/* Right Drive Board */}
          <div className="flex min-w-0 flex-col gap-4">
            {/* Top Bar: Title + Search + Sample Upload Triggers */}
            <div className="clay flex flex-col gap-3.5 p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-[family-name:var(--font-mono)] text-[11px] text-[var(--muted)]">
                    YOUR FILES · YOUR SPACE
                  </p>
                  <h3 className="font-[family-name:var(--font-display)] text-2xl font-medium">
                    {activeView === 'all'
                      ? 'All files'
                      : activeView === 'photos'
                        ? 'Photos'
                        : activeView === 'videos'
                          ? 'Videos'
                          : 'Documents'}
                  </h3>
                </div>

                {/* Live Filter Input */}
                <div className="clay-well-sm flex items-center gap-2 px-3.5 py-2">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="11" cy="11" r="6.5" stroke="#6d7b8c" strokeWidth="1.8" />
                    <path d="m16 16 4 4" stroke="#6d7b8c" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search food, travel, kyoto…"
                    aria-label="Filter indexed files"
                    className="w-40 bg-transparent text-xs text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none sm:w-48"
                  />
                </div>
              </div>

              {/* Interactive Sample Upload Queue Triggers with Thumbnail Previews */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="font-[family-name:var(--font-mono)] text-[11px] text-[var(--muted)]">
                  Test upload queue:
                </span>
                <button
                  type="button"
                  onClick={() => queuePreset(SAMPLE_PRESETS[0])}
                  disabled={Boolean(uploadingName)}
                  className="clay-pill gap-2 bg-[var(--lilac)] px-2.5 py-1 text-xs font-medium disabled:opacity-50"
                >
                  <img
                    src={SAMPLE_PRESETS[0].imageUrl}
                    alt=""
                    className="h-5 w-5 rounded-full object-cover"
                  />
                  <span>+ Food photo</span>
                </button>
                <button
                  type="button"
                  onClick={() => queuePreset(SAMPLE_PRESETS[1])}
                  disabled={Boolean(uploadingName)}
                  className="clay-pill gap-2 bg-[var(--mint)] px-2.5 py-1 text-xs font-medium disabled:opacity-50"
                >
                  <img
                    src={SAMPLE_PRESETS[1].imageUrl}
                    alt=""
                    className="h-5 w-5 rounded-full object-cover"
                  />
                  <span>+ Travel 4K video</span>
                </button>
                <button
                  type="button"
                  onClick={() => queuePreset(SAMPLE_PRESETS[2])}
                  disabled={Boolean(uploadingName)}
                  className="clay-pill gap-2 bg-[var(--accent)] px-2.5 py-1 text-xs font-medium disabled:opacity-50"
                >
                  <img
                    src={SAMPLE_PRESETS[2].imageUrl}
                    alt=""
                    className="h-5 w-5 rounded-full object-cover"
                  />
                  <span>+ Travel Guide PDF</span>
                </button>
                <button
                  type="button"
                  onClick={triggerOversizeStop}
                  disabled={Boolean(uploadingName)}
                  className="clay-pill bg-[var(--peach)] px-3 py-1.5 text-xs font-medium disabled:opacity-50"
                >
                  Test 2.4 GB file (2 GB stop)
                </button>
              </div>

              {/* Live Upload Progress Bar or Status Toast */}
              <div
                role="status"
                aria-live="polite"
                style={{
                  background:
                    statusBanner.tone === 'mint'
                      ? 'var(--mint)'
                      : statusBanner.tone === 'peach'
                        ? 'var(--peach)'
                        : 'var(--field)',
                }}
                className="flex flex-col gap-2 rounded-2xl px-3.5 py-2.5 text-xs transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-[var(--ink)]">{statusBanner.text}</span>
                  {uploadingName ? (
                    <span className="font-[family-name:var(--font-mono)] text-[11px] text-[var(--ink)]">
                      {uploadProgress}%
                    </span>
                  ) : null}
                </div>
                {uploadingName ? (
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/70">
                    <div
                      className="h-full rounded-full bg-[#3e4a5c] transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                ) : null}
              </div>
            </div>

            {/* Interactive File Cards Grid */}
            <div ref={gridRef} className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((file) => {
                const isSelected = selectedFile?.id === file.id
                const tint =
                  file.kind === 'photo'
                    ? 'var(--lilac)'
                    : file.kind === 'video'
                      ? 'var(--mint)'
                      : 'var(--peach)'
                return (
                  <article
                    key={file.id}
                    data-sandbox-card=""
                    style={{ background: tint }}
                    className={`clay flex flex-col justify-between gap-3 p-3.5 transition-all ${
                      isSelected ? 'ring-2 ring-[#3e4a5c]/30' : ''
                    }`}
                  >
                    {/* Real Photography / Media Preview Area */}
                    <button
                      type="button"
                      onClick={() => setSelectedFile(file)}
                      className="group relative block h-40 w-full overflow-hidden rounded-[20px] bg-[var(--clay)] text-left shadow-inner"
                    >
                      <img
                        src={file.imageUrl}
                        alt={file.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/15" />

                      <div className="absolute left-2.5 top-2.5">
                        <span className="clay-pill bg-[var(--clay)]/95 px-2.5 py-0.5 font-[family-name:var(--font-mono)] text-[10px] font-medium text-[var(--ink)]">
                          {file.category}
                        </span>
                      </div>

                      {file.kind === 'video' ? (
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[var(--ink)] shadow-md transition-transform group-hover:scale-110">
                            ▶
                          </span>
                        </div>
                      ) : null}

                      <div className="absolute inset-x-2.5 bottom-2.5 flex items-center justify-between">
                        <span className="clay-pill bg-[var(--clay)]/95 px-2.5 py-0.5 font-[family-name:var(--font-mono)] text-[10px] text-[var(--ink)]">
                          msg #{file.msgId}
                        </span>
                        <span className="clay-pill bg-[var(--clay)]/95 px-2.5 py-0.5 font-[family-name:var(--font-mono)] text-[10px] text-[var(--muted)] group-hover:text-[var(--ink)]">
                          {file.kind === 'video' && file.duration
                            ? `▶ ${file.duration}`
                            : file.kind === 'document' && file.pages
                              ? `PDF · ${file.pages}p`
                              : 'Open photo ↗'}
                        </span>
                      </div>
                    </button>

                    {/* Metadata + Quick Actions */}
                    <div className="flex items-start justify-between gap-2 px-1">
                      <div className="min-w-0">
                        <p className="truncate font-[family-name:var(--font-display)] text-sm font-medium text-[var(--ink)]">
                          {file.name}
                        </p>
                        <p className="font-[family-name:var(--font-mono)] text-[11px] text-[var(--muted)]">
                          {file.sizeLabel} · {file.category}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => simulateDownload(file)}
                        className="clay-pill flex-1 justify-center bg-[var(--clay)] py-1.5 text-xs font-medium"
                      >
                        {downloadingId === file.id ? 'Downloading…' : 'Download'}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFile(file)}
                        aria-label={`Delete ${file.name}`}
                        className="clay-pill bg-[var(--clay)] px-3 py-1.5 text-xs text-[var(--muted)] hover:text-[var(--ink)]"
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>

            {/* Selected File Inspector Drawer with Real Image Preview */}
            {selectedFile ? (
              <div className="clay flex flex-col justify-between gap-4 border border-white/80 bg-[var(--clay)] p-4 sm:flex-row sm:items-center sm:p-5">
                <div className="flex items-center gap-3.5">
                  <img
                    src={selectedFile.imageUrl}
                    alt={selectedFile.name}
                    className="h-14 w-14 shrink-0 rounded-2xl object-cover shadow-sm"
                  />
                  <div>
                    <p className="font-[family-name:var(--font-mono)] text-[11px] text-[var(--muted)]">
                      TELEGRAM SAVED MESSAGES · #{selectedFile.msgId} · {selectedFile.category.toUpperCase()}
                    </p>
                    <h4 className="font-[family-name:var(--font-display)] text-lg font-medium">
                      {selectedFile.name}
                    </h4>
                    <p className="text-xs text-[var(--muted)]">
                      {selectedFile.sizeLabel} · {selectedFile.mime} · Stored directly in your Telegram account
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => simulateDownload(selectedFile)}
                    className="clay-press rounded-full bg-[var(--accent)] px-4 py-2 text-xs font-medium"
                  >
                    {downloadingId === selectedFile.id ? 'Streaming from Telegram…' : 'Download from Telegram'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="clay-pill bg-[var(--field)] px-3.5 py-2 text-xs"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}

function PocketFlipCard({
  children,
  back,
}: {
  children: ReactNode
  back: ReactNode
}) {
  const boundsRef = useRef<HTMLDivElement>(null)
  const tiltRef = useRef<HTMLDivElement>(null)
  const targetRef = useRef({ x: 0, y: 0 })
  const [flipped, setFlipped] = useState(false)

  useEffect(() => {
    const tilt = tiltRef.current
    if (!tilt) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    const spring = { x: 0, y: 0, vx: 0, vy: 0 }
    let raf = 0
    let last = performance.now()

    const tick = (now: number) => {
      const dt = Math.min(0.032, Math.max(0.001, (now - last) / 1000))
      last = now
      const sub = dt / 2
      for (let i = 0; i < 2; i += 1) {
        const ax = -120 * (spring.x - targetRef.current.x) - 20 * spring.vx
        spring.vx += ax * sub
        spring.x += spring.vx * sub
        const ay = -120 * (spring.y - targetRef.current.y) - 20 * spring.vy
        spring.vy += ay * sub
        spring.y += spring.vy * sub
      }

      const x = Math.max(-0.5, Math.min(0.5, spring.x))
      const y = Math.max(-0.5, Math.min(0.5, spring.y))
      const map = (value: number, from: number, to: number) => from + ((value + 0.5) / 1) * (to - from)
      const rotX = map(y, 12, -12)
      const rotY = map(x, -12, 12)
      const liftX = map(x, -16, 16)
      const liftY = map(y, -16, 16)
      const shadowY = map(y, 20, 36)
      const shadowBlur = map(y, 40, 60)

      tilt.style.transform = `translate3d(${liftX.toFixed(2)}px, ${liftY.toFixed(2)}px, 0) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg)`
      tilt.style.boxShadow = `0 ${shadowY.toFixed(1)}px ${shadowBlur.toFixed(1)}px rgba(0, 0, 51, 0.25)`
      raf = window.requestAnimationFrame(tick)
    }

    raf = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="h-full min-h-[340px]" style={{ perspective: '900px' }}>
      <div
        ref={boundsRef}
        className="h-full"
        style={{ cursor: 'pointer', pointerEvents: flipped ? 'none' : 'auto' }}
        onMouseMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect()
          targetRef.current = {
            x: (event.clientX - rect.left) / rect.width - 0.5,
            y: (event.clientY - rect.top) / rect.height - 0.5,
          }
        }}
        onMouseLeave={() => {
          targetRef.current = { x: 0, y: 0 }
        }}
        onClick={(event) => {
          if ((event.target as HTMLElement).closest('button')) return
          setFlipped((value) => !value)
        }}
      >
        <div
          className="relative h-full"
          style={{
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transition: 'transform 0.6s ease-in-out',
          }}
        >
          <div ref={tiltRef} className="relative h-full" style={{ transformStyle: 'preserve-3d', borderRadius: 28 }}>
            <div
              className="h-full"
              style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', borderRadius: 28 }}
            >
              {children}
            </div>
            <div
              className="absolute inset-0"
              style={{
                transform: 'rotateY(180deg)',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                borderRadius: 28,
                overflow: 'hidden',
                pointerEvents: flipped ? 'auto' : 'none',
              }}
            >
              {back}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function WorksInteractiveSection() {
  const indexedRows = [
    {
      name: 'Kyoto trip photos.jpg',
      kind: 'Photo',
      img: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=240&q=75',
    },
    {
      name: 'Mountain reel.mp4',
      kind: 'Video',
      img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=240&q=75',
    },
    {
      name: 'Project notes.pdf',
      kind: 'Document',
      img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=240&q=75',
    },
  ]

  return (
    <section
      data-section-reveal=""
      className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-8 sm:py-20"
    >
      <div data-reveal-item="" className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
            HOW POCKET WORKS
          </p>
          <h2 className="mt-2.5 font-[family-name:var(--font-display)] text-3xl font-medium leading-none tracking-[-0.02em] text-[var(--ink)] sm:text-5xl">
            Your Telegram. Your files. <span className="italic">All in one place.</span>
          </h2>
        </div>
        <p className="max-w-md text-sm leading-relaxed text-[var(--muted)] sm:text-base">
          Find, organize, and download your files without digging through endless Telegram messages.
        </p>
      </div>

      <ul className="mt-8 grid grid-cols-1 items-stretch gap-5 md:grid-cols-2 lg:grid-cols-3">
        {/* Card 01 — Connect */}
        <li data-reveal-item="" className="min-h-[350px] min-w-0">
          <PocketFlipCard
            back={
              <div className="clay flex h-full flex-col justify-between bg-[var(--accent)] p-6 text-left">
                <p className="font-[family-name:var(--font-mono)] text-[10px] font-semibold tracking-[0.14em] text-[var(--ink)]">
                  01 · CONNECT
                </p>
                <div>
                  <h3 className="font-[family-name:var(--font-display)] text-2xl font-medium">
                    Use the account you already have.
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--ink)]/80">
                    Sign in with your Telegram phone number and confirmation code. No new storage account to set up.
                  </p>
                </div>
                <p className="font-[family-name:var(--font-mono)] text-[11px] text-[var(--ink)]/75">
                  Tap to flip back
                </p>
              </div>
            }
          >
            <div
              className="clay flex h-full flex-col justify-between gap-5 p-5 sm:p-6"
              style={{
                background: 'linear-gradient(155deg, #e3e9ff 0%, #d2dcff 55%, #bccaff 100%)',
                border: '1.5px solid rgba(255, 255, 255, 0.85)',
              }}
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="clay-pill shrink-0 bg-[var(--clay)] px-3 py-1.5 font-[family-name:var(--font-mono)] text-[10px] font-semibold tracking-[0.14em] text-[var(--ink)]">
                    01 · CONNECT
                  </span>
                </div>

                <div>
                  <h3 className="font-[family-name:var(--font-display)] text-2xl font-medium">
                    Connect your Telegram
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--ink)]/80">
                    Sign in with your Telegram account and let Pocket organize your files in one convenient place.
                  </p>
                </div>
              </div>

              {/* Visual: Simple Telegram -> Pocket bridge */}
              <div className="clay-well-sm flex items-center justify-between gap-1.5 bg-white/60 px-2.5 py-3 sm:gap-2.5 sm:px-3.5 sm:py-3.5">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <span className="clay-pill flex h-8 w-8 shrink-0 items-center justify-center bg-[#5569dc] text-white sm:h-9 sm:w-9">
                    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true">
                      <path
                        d="M21.2 4.4 2.9 11.5c-.8.3-.8 1.4 0 1.7l4.7 1.7 1.8 5.3c.3.8 1.3 1 1.9.3l2.7-3.1 4.6 3.4c.7.5 1.7.1 1.9-.8l2.2-14.3c.2-.9-.7-1.6-1.5-1.3Z"
                        fill="currentColor"
                      />
                    </svg>
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-[var(--ink)]">Telegram</p>
                    <p className="truncate font-[family-name:var(--font-mono)] text-[9.5px] text-[var(--muted)] sm:text-[10px]">
                      Your account
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1 text-[var(--muted)]" aria-hidden="true">
                  <span className="hidden h-1.5 w-1.5 rounded-full bg-[#5569dc]/50 sm:inline-block" />
                  <span className="hidden h-0.5 w-4 rounded-full bg-[#5569dc]/40 sm:inline-block" />
                  <span className="text-xs font-semibold text-[#5569dc]">→</span>
                </div>

                <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
                  <Logo className="h-8 w-8 shrink-0 sm:h-9 sm:w-9" />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-[var(--ink)]">Pocket</p>
                    <p className="truncate font-[family-name:var(--font-mono)] text-[9.5px] text-[var(--muted)] sm:text-[10px]">
                      Your drive
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </PocketFlipCard>
        </li>

        {/* Card 02 — Organize */}
        <li data-reveal-item="" className="min-h-[350px] min-w-0">
          <PocketFlipCard
            back={
              <div className="clay flex h-full flex-col justify-between bg-[var(--lilac)] p-6 text-left">
                <p className="font-[family-name:var(--font-mono)] text-[10px] font-semibold tracking-[0.14em] text-[var(--ink)]">
                  02 · ORGANIZE
                </p>
                <div>
                  <h3 className="font-[family-name:var(--font-display)] text-2xl font-medium">
                    Turn scattered messages into a library.
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--ink)]/80">
                    Nothing moves to a separate cloud. Your files stay in Saved Messages while Pocket gives them a clean home.
                  </p>
                </div>
                <p className="font-[family-name:var(--font-mono)] text-[11px] text-[var(--ink)]/75">
                  Tap to flip back
                </p>
              </div>
            }
          >
            <div
              className="clay flex h-full flex-col justify-between gap-5 p-5 sm:p-6"
              style={{
                background: 'linear-gradient(155deg, #ede9fb 0%, #dfd8f8 55%, #cfc4f4 100%)',
                border: '1.5px solid rgba(255, 255, 255, 0.85)',
              }}
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="clay-pill shrink-0 bg-[var(--clay)] px-3 py-1.5 font-[family-name:var(--font-mono)] text-[10px] font-semibold tracking-[0.14em] text-[var(--ink)]">
                    02 · ORGANIZE
                  </span>
                </div>

                <div>
                  <h3 className="font-[family-name:var(--font-display)] text-2xl font-medium">
                    Already in Telegram? Already yours.
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--ink)]/80">
                    Your files stay in your own Telegram Saved Messages. Pocket gives them a cleaner, easier way to access.
                  </p>
                </div>
              </div>

              {/* Visual: Chat message -> Clean file card */}
              <div className="clay-well-sm flex items-center justify-between gap-2 bg-white/60 p-2.5 sm:gap-3 sm:p-3">
                <div className="flex min-w-0 flex-1 items-center gap-2.5 rounded-2xl bg-[var(--clay)] p-2 shadow-xs sm:gap-3 sm:p-2.5">
                  <img
                    src="https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=240&q=75"
                    alt="Saved photo"
                    className="h-10 w-10 shrink-0 rounded-xl object-cover sm:h-11 sm:w-11"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-[var(--ink)]">
                      Tokyo dinner.jpg
                    </p>
                    <p className="mt-0.5 truncate font-[family-name:var(--font-mono)] text-[9.5px] text-[var(--muted)] sm:text-[10px]">
                      Saved Messages → Picture Card
                    </p>
                  </div>
                </div>
                <span className="clay-pill hidden shrink-0 bg-[var(--lilac)] px-2.5 py-1 font-[family-name:var(--font-mono)] text-[10px] font-medium text-[var(--ink)] min-[380px]:inline-flex">
                  Organized
                </span>
              </div>
            </div>
          </PocketFlipCard>
        </li>

        {/* Card 03 — Access */}
        <li data-reveal-item="" className="min-h-[350px] min-w-0 md:col-span-2 lg:col-span-1">
          <PocketFlipCard
            back={
              <div className="clay flex h-full flex-col justify-between bg-[var(--mint)] p-6 text-left">
                <p className="font-[family-name:var(--font-mono)] text-[10px] font-semibold tracking-[0.14em] text-[var(--ink)]">
                  03 · ACCESS
                </p>
                <div>
                  <h3 className="font-[family-name:var(--font-display)] text-2xl font-medium">
                    Find, preview, and download with ease.
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--ink)]/80">
                    Photos, videos, and documents each get their own dedicated view—ready whenever you need them.
                  </p>
                </div>
                <p className="font-[family-name:var(--font-mono)] text-[11px] text-[var(--ink)]/75">
                  Tap to flip back
                </p>
              </div>
            }
          >
            <div
              className="clay flex h-full flex-col justify-between gap-5 p-5 sm:p-6"
              style={{
                background: 'linear-gradient(155deg, #e1f4ec 0%, #ccece0 55%, #b5e2d1 100%)',
                border: '1.5px solid rgba(255, 255, 255, 0.85)',
              }}
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="clay-pill shrink-0 bg-[var(--clay)] px-3 py-1.5 font-[family-name:var(--font-mono)] text-[10px] font-semibold tracking-[0.14em] text-[var(--ink)]">
                    03 · ACCESS
                  </span>
                </div>

                <div>
                  <h3 className="font-[family-name:var(--font-display)] text-2xl font-medium">
                    Find anything, faster.
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--ink)]/80">
                    Browse your photos, videos, and documents in one organized view. Preview what you need and download it when you want.
                  </p>
                </div>
              </div>

              {/* Visual: Clean file list with Photo, Video, and Document thumbnails */}
              <div className="clay-well-sm flex flex-col gap-1.5 bg-white/60 p-3">
                {indexedRows.map((row) => (
                  <div
                    key={row.name}
                    className="flex items-center justify-between gap-2 rounded-xl bg-[var(--clay)] px-2.5 py-1.5 text-xs shadow-2xs"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <img src={row.img} alt={row.name} className="h-7 w-7 shrink-0 rounded-lg object-cover" />
                      <span className="truncate font-medium text-[var(--ink)]">{row.name}</span>
                    </div>
                    <span className="shrink-0 font-[family-name:var(--font-mono)] text-[10px] text-[var(--muted)]">
                      {row.kind}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </PocketFlipCard>
        </li>
      </ul>
    </section>
  )
}

type FramerStackCard = {
  title: string
  description: string
  tag: string
  cardGradient: string
  pillBg: string
  accentColor: string
  glowColor: string
  photos: { src: string; label: string; meta: string }[]
}

const FRAMER_FEATURE_CARDS: FramerStackCard[] = [
  {
    title: 'Send one file, or a folder full',
    description: 'Pocket queues them one after another into Saved Messages.',
    tag: 'Upload',
    cardGradient: 'linear-gradient(145deg, #f9fbff 0%, #eff3ff 58%, #e2e9ff 100%)',
    pillBg: 'var(--accent)',
    accentColor: '#5569dc',
    glowColor: 'rgba(155, 173, 245, 0.65)',
    photos: [
      {
        src: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=240&q=75',
        label: 'kyoto-bamboo.jpg',
        meta: 'Travel · 18.4 MB',
      },
      {
        src: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=240&q=75',
        label: 'tokyo-ramen.jpg',
        meta: 'Food · 12.8 MB',
      },
    ],
  },
  {
    title: 'Photos, videos, and documents',
    description: 'Each kind gets its own view. Photos and videos open as picture cards.',
    tag: 'Views',
    cardGradient: 'linear-gradient(145deg, #fcfbff 0%, #f2effc 58%, #e6e1f9 100%)',
    pillBg: 'var(--lilac)',
    accentColor: '#7b61d4',
    glowColor: 'rgba(191, 178, 244, 0.65)',
    photos: [
      {
        src: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=240&q=75',
        label: 'sourdough-bake.jpg',
        meta: 'Food · Picture Card',
      },
      {
        src: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=240&q=75',
        label: 'dolomites-fpv.mp4',
        meta: 'Travel · ▶ 01:48',
      },
    ],
  },
  {
    title: 'Preview in place, download original',
    description: 'Watch videos, inspect photos, or pull the original file back down.',
    tag: 'Stream',
    cardGradient: 'linear-gradient(145deg, #f9fdfb 0%, #ebf7f2 58%, #dcefe7 100%)',
    pillBg: 'var(--mint)',
    accentColor: '#3b9874',
    glowColor: 'rgba(146, 214, 187, 0.62)',
    photos: [
      {
        src: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=240&q=75',
        label: 'amalfi-coast.mov',
        meta: 'Cinema · 1.18 GB',
      },
      {
        src: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=240&q=75',
        label: 'neapolitan-pizza.jpg',
        meta: 'Food · 16.4 MB',
      },
    ],
  },
  {
    title: 'Delete once, gone from Telegram',
    description: 'Removes the message from Saved Messages first. Anything over 2 GB stops at the door.',
    tag: '2 GB Limit',
    cardGradient: 'linear-gradient(145deg, #fffcfa 0%, #fbf0ea 58%, #f7e4d8 100%)',
    pillBg: 'var(--peach)',
    accentColor: '#d46a43',
    glowColor: 'rgba(240, 184, 156, 0.65)',
    photos: [
      {
        src: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=240&q=75',
        label: 'nordic-cabin.pdf',
        meta: '✓ Allowed (< 2 GB)',
      },
      {
        src: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=240&q=75',
        label: 'swiss-alps-raw.mov',
        meta: '✕ 2.4 GB Stopped',
      },
    ],
  },
]

const CINEMATIC_PRESET = {
  scaleBack: 0.82,
  zBack: -340,
  rotExit: -64,
  yBack: 34,
  blurMax: 9,
}

function framerInterpolate(value: number, domain: number[], range: number[]): number {
  if (value <= domain[0]) return range[0]
  const last = domain.length - 1
  if (value >= domain[last]) return range[last]
  for (let i = 0; i < last; i += 1) {
    const d0 = domain[i]
    const d1 = domain[i + 1]
    if (value >= d0 && value <= d1) {
      const t = d1 === d0 ? 0 : (value - d0) / (d1 - d0)
      return range[i] + t * (range[i + 1] - range[i])
    }
  }
  return range[last]
}

export function FeaturesInteractiveSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const headerRefs = useRef<(HTMLDivElement | null)[]>([])
  const dotAccentRefs = useRef<(HTMLDivElement | null)[]>([])
  const titleRefs = useRef<(HTMLDivElement | null)[]>([])
  const descRefs = useRef<(HTMLDivElement | null)[]>([])
  const photosRefs = useRef<(HTMLDivElement | null)[]>([])
  const barAccentRefs = useRef<(HTMLDivElement | null)[]>([])
  const indicatorRefs = useRef<(HTMLDivElement | null)[]>([])
  const glowRef = useRef<HTMLDivElement>(null)

  const cursorTargetRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const total = FRAMER_FEATURE_CARDS.length
    const s = CINEMATIC_PRESET
    const cardHeight = 320
    const h = -1 * cardHeight * 0.46
    const g = s.rotExit

    const getScrollProgress = () => {
      const rect = container.getBoundingClientRect()
      const scrollable = Math.max(1, rect.height - window.innerHeight)
      const raw = Math.min(1, Math.max(0, -rect.top / scrollable))
      // Finish all 4 card transitions by 82% of the sticky scroll so Card 04 still rests before unsticking
      return Math.min(1, raw / 0.82)
    }

    // Quicker than the old overdamped spring, still eased so a flip does not snap
    let scrollPos = getScrollProgress()
    let scrollVel = 0
    let cursorX = 0
    let cursorXVel = 0
    let cursorY = 0
    let cursorYVel = 0
    let lastActiveIdx = -1
    let rafId = 0
    let lastTime = performance.now()

    const renderFrame = (activeIndex: number, cx: number, cy: number) => {
      // Update ambient clay glow color when active rounded card changes
      const roundedIdx = Math.round(Math.max(0, Math.min(total - 1, activeIndex)))
      if (roundedIdx !== lastActiveIdx && glowRef.current) {
        lastActiveIdx = roundedIdx
        const glow = FRAMER_FEATURE_CARDS[roundedIdx]?.glowColor || 'rgba(155, 173, 245, 0.65)'
        glowRef.current.style.background = `radial-gradient(circle at 50% 54%, ${glow} 0%, transparent 62%)`
      }

      for (let t = 0; t < total; t += 1) {
        const cardEl = cardRefs.current[t]
        if (!cardEl) continue

        const p = activeIndex - t
        const scale = framerInterpolate(
          p,
          [-4, -3, -2, -1, 0, 0.5, 1],
          [
            s.scaleBack - 0.1,
            s.scaleBack - 0.05,
            s.scaleBack,
            s.scaleBack + (1 - s.scaleBack) * 0.6,
            1,
            0.98,
            0.92,
          ],
        )
        const y = framerInterpolate(
          p,
          [-4, -3, -2, -1, 0, 1],
          [s.yBack * 3, s.yBack * 2.3, s.yBack * 1.5, s.yBack * 0.75, 0, h],
        )
        const z = framerInterpolate(
          p,
          [-4, -3, -2, -1, 0, 0.4, 1],
          [s.zBack * 1.6, s.zBack * 1.15, s.zBack * 0.75, s.zBack * 0.35, 0, 30, 70],
        )
        const opacity = framerInterpolate(
          p,
          [-4, -3.2, -3, -1, 0, 0.36, 0.68],
          [0, 0.35, 0.68, 0.96, 1, 0.72, 0],
        )
        const rotScroll = framerInterpolate(p, [0, 1], [0, g])
        const blur = framerInterpolate(
          p,
          [-4, -3, -2, -1, 0, 0.8, 1],
          [s.blurMax * 0.65, s.blurMax * 0.45, s.blurMax * 0.28, s.blurMax * 0.12, 0, s.blurMax * 0.3, s.blurMax * 0.7],
        )
        const shadowAlpha = framerInterpolate(p, [-3, -1, 0, 1], [0.18, 0.42, 0.65, 0])
        const activeFactor = framerInterpolate(p, [-1, 0, 1], [0, 1, 0])

        const tiltX = cy * 5 * activeFactor
        const tiltY = -cx * 6 * activeFactor
        const rotX = rotScroll + tiltX

        const ce = framerInterpolate(p, [-1, 0, 1], [14, 0, -10])
        const le = ce * 1.6
        const ue = ce * 0.7

        cardEl.style.opacity = opacity.toFixed(3)
        cardEl.style.filter = `blur(${blur.toFixed(2)}px)`
        cardEl.style.boxShadow = `-10px -10px 22px rgba(255, 255, 255, 0.96), 14px 18px 34px rgba(162, 180, 204, ${shadowAlpha.toFixed(3)}), 0 24px 48px rgba(62, 74, 92, ${(shadowAlpha * 0.22).toFixed(3)}), inset 3px 3px 8px rgba(255, 255, 255, 0.96), inset -4px -5px 12px rgba(178, 194, 214, 0.42)`
        cardEl.style.transform = `translate3d(0px, ${y.toFixed(2)}px, ${z.toFixed(2)}px) scale(${scale.toFixed(4)}) rotateX(${rotX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg)`
        cardEl.style.pointerEvents = Math.abs(p) < 0.45 ? 'auto' : 'none'

        const headerEl = headerRefs.current[t]
        if (headerEl) headerEl.style.transform = `translateY(${ce.toFixed(2)}px)`

        const titleEl = titleRefs.current[t]
        if (titleEl) titleEl.style.transform = `translateY(${le.toFixed(2)}px)`

        const descEl = descRefs.current[t]
        if (descEl) descEl.style.transform = `translateY(${ue.toFixed(2)}px)`

        const photosEl = photosRefs.current[t]
        if (photosEl) photosEl.style.transform = `translateY(${(ue * 0.85).toFixed(2)}px)`

        const dotEl = dotAccentRefs.current[t]
        if (dotEl) dotEl.style.opacity = activeFactor.toFixed(3)

        const barEl = barAccentRefs.current[t]
        if (barEl) barEl.style.opacity = activeFactor.toFixed(3)

        const indEl = indicatorRefs.current[t]
        if (indEl) {
          const dist = Math.abs(activeIndex - t)
          const indScale = framerInterpolate(dist, [0, 1, 3], [1.9, 1, 0.85])
          const indOp = framerInterpolate(dist, [0, 1, 3], [1, 0.42, 0.22])
          indEl.style.transform = `scale(${indScale.toFixed(3)})`
          indEl.style.opacity = indOp.toFixed(3)
        }
      }
    }

    const tick = (now: number) => {
      const dt = Math.min(0.032, Math.max(0.001, (now - lastTime) / 1000))
      lastTime = now

      const targetScroll = getScrollProgress()
      if (Math.abs(targetScroll - scrollPos) > 0.35) {
        scrollPos = targetScroll
        scrollVel = 0
      }

      const steps = 2
      const subDt = dt / steps
      for (let i = 0; i < steps; i += 1) {
        const scrollForce = -110 * (scrollPos - targetScroll) - 34 * scrollVel
        scrollVel += (scrollForce / 0.45) * subDt
        scrollPos += scrollVel * subDt

        const cxForce = -130 * (cursorX - cursorTargetRef.current.x) - 22 * cursorXVel
        cursorXVel += cxForce * subDt
        cursorX += cursorXVel * subDt

        const cyForce = -130 * (cursorY - cursorTargetRef.current.y) - 22 * cursorYVel
        cursorYVel += cyForce * subDt
        cursorY += cursorYVel * subDt
      }

      const activeIndex = scrollPos * Math.max(total - 1, 0.0001)
      renderFrame(activeIndex, cursorX, cursorY)

      rafId = window.requestAnimationFrame(tick)
    }

    rafId = window.requestAnimationFrame(tick)
    return () => {
      window.cancelAnimationFrame(rafId)
    }
  }, [])

  const total = FRAMER_FEATURE_CARDS.length

  return (
    <div
      ref={containerRef}
      style={{
        height: '340vh',
        width: '100%',
        position: 'relative',
        zIndex: 20,
      }}
    >
      <div
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          cursorTargetRef.current = {
            x: (e.clientX - rect.left) / rect.width - 0.5,
            y: (e.clientY - rect.top) / rect.height - 0.5,
          }
        }}
        onMouseLeave={() => {
          cursorTargetRef.current = { x: 0, y: 0 }
        }}
        className="ambient-field"
        style={{
          position: 'sticky',
          top: 0,
          height: '100svh',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          paddingTop: 'clamp(96px, 12vh, 120px)',
          paddingBottom: 'clamp(12px, 3vh, 40px)',
          boxSizing: 'border-box',
          perspective: '1600px',
          overflow: 'hidden',
          isolation: 'isolate',
          backgroundColor: 'var(--field)',
        }}
      >
        {/* Soft pastel clay halo synced with active card */}
        <div
          ref={glowRef}
          style={{
            position: 'absolute',
            inset: '0',
            background: 'radial-gradient(circle at 50% 54%, rgba(155, 173, 245, 0.65) 0%, transparent 62%)',
            pointerEvents: 'none',
            zIndex: 0,
            filter: 'blur(42px)',
            opacity: 0.78,
            transition: 'background 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
            willChange: 'transform',
          }}
        />

        <div className="relative z-10 my-auto flex w-full flex-col items-center">
          {/* Section Eyebrow & Heading matching LIVE PRODUCT SANDBOX style */}
          <div className="relative z-20 mx-auto mb-3 w-full max-w-6xl shrink-0 px-4 sm:mb-6 sm:px-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                  FEATURES
                </p>
                <h2
                  data-flight-features=""
                  className="mt-2 font-[family-name:var(--font-display)] text-3xl font-medium leading-none tracking-[-0.02em] text-[var(--ink)] sm:mt-2.5 sm:text-5xl"
                >
                  Built for the files <span className="italic">you actually keep</span>.
                </h2>
              </div>
            </div>
          </div>

          {/* 3D Preserve-3D Claymorphic Card Stack Stage */}
          <div
            style={{
              position: 'relative',
              width: 'min(548px, calc(100vw - 28px))',
              height: 'clamp(310px, calc(100svh - 180px), 400px)',
              flexShrink: 0,
              perspective: '1600px',
              transformStyle: 'preserve-3d',
              zIndex: 1,
            }}
          >
            {FRAMER_FEATURE_CARDS.map((card, t) => (
              <div
                key={card.title}
                ref={(el) => {
                  cardRefs.current[t] = el
                }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  borderRadius: '28px',
                  background: card.cardGradient,
                  border: '1.5px solid rgba(255, 255, 255, 0.92)',
                  padding: 'clamp(16px, 4%, 36px)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxSizing: 'border-box',
                  transformOrigin: '50% 100%',
                  transformStyle: 'preserve-3d',
                  backfaceVisibility: 'hidden',
                  willChange: 'transform, opacity, filter',
                  zIndex: total - t,
                  overflow: 'hidden',
                }}
              >
                {/* Top Row: 01 — 04 Clay Counter + Category Clay Pill */}
                <div
                  ref={(el) => {
                    headerRefs.current[t] = el
                  }}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    zIndex: 2,
                  }}
                >
                  <div
                    className="clay-pill bg-[var(--clay)] px-3 py-1 font-[family-name:var(--font-mono)]"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'baseline',
                      gap: '6px',
                      fontVariantNumeric: 'tabular-nums',
                      letterSpacing: '0.14em',
                      fontSize: '11px',
                      fontWeight: 600,
                    }}
                  >
                    <span style={{ color: 'var(--ink)' }}>
                      {String(t + 1).padStart(2, '0')}
                    </span>
                    <span style={{ color: 'rgba(62, 74, 92, 0.35)' }}>—</span>
                    <span style={{ color: 'var(--muted)' }}>
                      {String(total).padStart(2, '0')}
                    </span>
                  </div>

                  <span
                    className="clay-pill font-[family-name:var(--font-mono)]"
                    style={{
                      fontSize: '10px',
                      fontWeight: 600,
                      color: 'var(--ink)',
                      background: card.pillBg,
                      padding: '6px 14px',
                      borderRadius: '999px',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {card.tag}
                  </span>
                </div>

                {/* Top Center Tactile Clay Accent Bead */}
                <div
                  ref={(el) => {
                    dotAccentRefs.current[t] = el
                  }}
                  style={{
                    position: 'absolute',
                    top: 'clamp(22px, 4.5%, 38px)',
                    left: '50%',
                    width: '8px',
                    height: '8px',
                    marginLeft: '-4px',
                    borderRadius: '99px',
                    background: card.accentColor,
                    boxShadow: `0 0 12px ${card.accentColor}, inset 1px 1px 2px rgba(255,255,255,0.85)`,
                  }}
                />

                {/* Center Title + Description + Claymorphic Category Photo Wells */}
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <div
                    ref={(el) => {
                      titleRefs.current[t] = el
                    }}
                    className="font-[family-name:var(--font-display)]"
                    style={{
                      fontSize: 'clamp(20px, 3.2vw, 34px)',
                      fontWeight: 500,
                      color: 'var(--ink)',
                      lineHeight: 1.08,
                      marginBottom: '6px',
                      letterSpacing: '-0.025em',
                    }}
                  >
                    {card.title}
                  </div>
                  <div
                    ref={(el) => {
                      descRefs.current[t] = el
                    }}
                    style={{
                      fontSize: 'clamp(12px, 1.8vh, 14px)',
                      color: 'var(--muted)',
                      lineHeight: 1.5,
                      fontWeight: 400,
                      maxWidth: '94%',
                    }}
                  >
                    {card.description}
                  </div>

                  {/* Tactile Clay Wells with Real Food / Travel / Architecture Photos */}
                  <div
                    ref={(el) => {
                      photosRefs.current[t] = el
                    }}
                    className="mt-2.5 grid grid-cols-1 gap-1.5 min-[480px]:grid-cols-2 sm:mt-3.5 sm:gap-2.5"
                  >
                    {card.photos.map((photo, pIdx) => (
                      <div
                        key={photo.label}
                        className={`clay-well-sm min-w-0 items-center gap-2.5 px-2.5 py-1.5 sm:py-2 ${
                          pIdx >= 2 ? 'hidden min-[480px]:flex' : 'flex'
                        }`}
                        style={{
                          background: 'rgba(231, 238, 246, 0.78)',
                          border: '1px solid rgba(255, 255, 255, 0.82)',
                        }}
                      >
                        <img
                          src={photo.src}
                          alt={photo.label}
                          className="h-8 w-10 shrink-0 rounded-lg border border-white/90 object-cover shadow-xs sm:h-10 sm:w-12 sm:rounded-xl"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-[family-name:var(--font-display)] text-xs font-semibold text-[var(--ink)]">
                            {photo.label}
                          </p>
                          <p className="truncate font-[family-name:var(--font-mono)] text-[10px] text-[var(--muted)]">
                            {photo.meta}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Left Tactile Clay Accent Pill Bar */}
                <div
                  ref={(el) => {
                    barAccentRefs.current[t] = el
                  }}
                  style={{
                    position: 'absolute',
                    left: 'clamp(18px, 4%, 36px)',
                    bottom: 'clamp(12px, 3%, 24px)',
                    width: '44px',
                    height: '4px',
                    borderRadius: '99px',
                    background: card.accentColor,
                    boxShadow: `0 2px 8px ${card.glowColor}, inset 1px 1px 1px rgba(255,255,255,0.75)`,
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right Side Claymorphic Progress Pill (hidden on small phones so it never overlaps cards) */}
        <div
          className="clay-pill hidden bg-[var(--clay)]/90 px-2.5 py-3.5 md:flex"
          style={{
            position: 'absolute',
            top: '50%',
            right: '24px',
            transform: 'translateY(-50%)',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          {FRAMER_FEATURE_CARDS.map((card, t) => (
            <div
              key={card.title}
              ref={(el) => {
                indicatorRefs.current[t] = el
              }}
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '99px',
                background: 'var(--ink)',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

const HOW_TO_USE_STEPS = [
  {
    step: '01',
    title: 'Open Pocket',
    position: 'bottom' as const,
    tint: 'var(--accent)',
    photo: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=240&q=75',
    icon: StepGlobeIcon,
  },
  {
    step: '02',
    title: 'Sign in with Telegram',
    position: 'top' as const,
    tint: 'var(--lilac)',
    photo: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=240&q=75',
    icon: StepLoginIcon,
  },
  {
    step: '03',
    title: 'Pick your files',
    position: 'bottom' as const,
    tint: 'var(--peach)',
    photo: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=240&q=75',
    icon: StepSelectIcon,
  },
  {
    step: '04',
    title: 'Sent to Saved Messages',
    position: 'top' as const,
    tint: 'var(--mint)',
    photo: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=240&q=75',
    icon: StepSyncIcon,
  },
  {
    step: '05',
    title: 'Sorted by kind',
    position: 'bottom' as const,
    tint: 'var(--lilac)',
    photo: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=240&q=75',
    icon: StepCameraIcon,
  },
  {
    step: '06',
    title: 'Open, download, or delete',
    position: 'top' as const,
    tint: 'var(--accent)',
    photo: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=240&q=75',
    icon: StepCheckIcon,
  },
]

export function InteractiveStepsList() {
  const triggerRef = useRef<HTMLDivElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const progressPathRef = useRef<SVGPathElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const triggerEl = triggerRef.current
    const viewportEl = viewportRef.current
    const trackEl = trackRef.current
    if (!triggerEl || !viewportEl || !trackEl) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    const getScrollDistance = () => {
      if (!trackEl || !viewportEl) return 0
      return Math.max(0, trackEl.scrollWidth - viewportEl.clientWidth + 80)
    }

    const ctx = gsap.context(() => {
      const pathEl = progressPathRef.current
      let totalLen = 0
      if (pathEl) {
        totalLen = pathEl.getTotalLength()
        gsap.set(pathEl, {
          strokeDasharray: totalLen,
          strokeDashoffset: totalLen,
        })
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: triggerEl,
          pin: true,
          pinSpacing: true,
          refreshPriority: 1,
          scrub: 1,
          start: 'top top',
          end: () => `+=${getScrollDistance() + 750}`,
          invalidateOnRefresh: true,
          onRefresh: () => {
            if (pathEl) {
              totalLen = pathEl.getTotalLength()
              gsap.set(pathEl, { strokeDasharray: totalLen })
            }
          },
          onUpdate: (self) => {
            const moveProgress = Math.min(1, self.progress / 0.86)
            const idx = Math.min(
              HOW_TO_USE_STEPS.length - 1,
              Math.floor(moveProgress * HOW_TO_USE_STEPS.length),
            )
            setActiveIndex(idx)
            if (pathEl && totalLen > 0) {
              gsap.set(pathEl, {
                strokeDashoffset: totalLen * (1 - moveProgress),
              })
            }
          },
        },
      })

      tl.to(trackEl, {
        x: () => -getScrollDistance(),
        ease: 'none',
        duration: 0.86,
      }).to(trackEl, {
        x: () => -getScrollDistance(),
        ease: 'none',
        duration: 0.14,
      })

      ScrollTrigger.sort()
      ScrollTrigger.refresh()
    }, triggerEl)

    let resizeTimer = 0
    const onResize = () => {
      window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(() => {
        ScrollTrigger.refresh()
      }, 120)
    }
    window.addEventListener('resize', onResize)

    return () => {
      window.clearTimeout(resizeTimer)
      window.removeEventListener('resize', onResize)
      ctx.revert()
    }
  }, [])

  return (
    <div className="relative z-10 w-full overflow-x-clip pt-16 sm:pt-24">
      <div ref={triggerRef} className="ambient-field relative z-10 w-full max-w-full overflow-hidden select-none">
        <section
          id="steps"
          style={{
            paddingTop: 'clamp(96px, 12vh, 120px)',
            paddingBottom: 'clamp(10px, 2.5vh, 32px)',
          }}
          className="relative flex h-svh w-full scroll-mt-20 flex-col items-center justify-start overflow-hidden"
        >
          <div className="my-auto mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Header matching LIVE PRODUCT SANDBOX section style */}
            <div
              style={{ marginBottom: 'clamp(8px, 2vh, 24px)' }}
              className="mx-auto w-full max-w-6xl px-0 sm:px-2"
            >
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                    HOW TO USE POCKET
                  </p>
                  <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-medium leading-none tracking-[-0.02em] text-[var(--ink)] sm:mt-2.5 sm:text-5xl">
                    From sign-in <span className="italic">to your first file</span>.
                  </h2>
                </div>
              </div>
            </div>

            {/* Horizontal Scroll Track + Sinusoidal Dashed Wave Path */}
            <div ref={viewportRef} className="relative w-full overflow-hidden py-1 sm:py-3">
              <div
                ref={trackRef}
                className="relative z-10 flex w-max items-center space-x-8 pl-2 pr-24 sm:space-x-16 sm:pl-10 sm:pr-56 md:space-x-24 md:pl-16 md:pr-72"
              >
                {/* Background Dashed Wave + Animated Foreground Draw Path */}
                <svg
                  preserveAspectRatio="none"
                  viewBox="0 0 2650 120"
                  fill="none"
                  style={{ height: 'clamp(64px, 12vh, 128px)' }}
                  className="pointer-events-none absolute left-0 right-0 top-1/2 z-0 w-full -translate-y-1/2"
                  aria-hidden="true"
                >
                  <path
                    d="M 40 60 C 230 112, 430 8, 630 60 C 830 112, 1030 8, 1230 60 C 1430 112, 1630 8, 1830 60 C 2030 112, 2230 8, 2430 60 C 2520 88, 2590 60, 2640 60"
                    stroke="#3e4a5c"
                    strokeWidth="3.5"
                    strokeDasharray="8 8"
                    strokeOpacity="0.32"
                  />
                  <path
                    ref={progressPathRef}
                    d="M 40 60 C 230 112, 430 8, 630 60 C 830 112, 1030 8, 1230 60 C 1430 112, 1630 8, 1830 60 C 2030 112, 2230 8, 2430 60 C 2520 88, 2590 60, 2640 60"
                    stroke="#3e4a5c"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeOpacity="0.85"
                  />
                  <circle cx="2640" cy="60" r="6" fill="#3e4a5c" fillOpacity="0.45" />
                </svg>

                {HOW_TO_USE_STEPS.map((item, idx) => {
                  const Icon = item.icon
                  const isTop = item.position === 'top'
                  const isReached = idx <= activeIndex

                  const cardContent = (
                    <div
                      style={{
                        background: item.tint,
                        padding: 'clamp(8px, 1.5vh, 14px) clamp(12px, 1.8vw, 18px)',
                      }}
                      className={`clay mx-auto flex max-w-[330px] flex-col items-center rounded-3xl text-center transition-all duration-300 ${
                        isReached ? 'scale-100 opacity-100' : 'scale-95 opacity-85'
                      }`}
                    >
                      <div className="mb-1 flex items-center gap-2">
                        <img
                          src={item.photo}
                          alt={item.title}
                          className="h-5 w-7 rounded-lg object-cover shadow-2xs sm:h-6 sm:w-8"
                        />
                        {/* <span className="clay-pill bg-[var(--clay)] px-2 py-0.5 font-[family-name:var(--font-mono)] text-[10px] font-medium text-[var(--ink)]">
                          {item.tag}
                        </span> */}
                      </div>
                      <h3
                        style={{ fontSize: 'clamp(0.95rem, 2.2vh, 1.25rem)' }}
                        className="font-[family-name:var(--font-display)] font-medium leading-snug tracking-tight text-[var(--ink)]"
                      >
                        {item.title}
                      </h3>
                      {/* <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-[var(--muted)] sm:line-clamp-none sm:text-xs">
                        {item.description}
                      </p> */}
                    </div>
                  )

                  return (
                    <div
                      key={item.step}
                      className="group flex w-[210px] flex-shrink-0 flex-col items-center text-center sm:w-[290px] md:w-[340px]"
                    >
                      {/* Top Slot */}
                      {isTop ? (
                        <div
                          style={{
                            height: 'clamp(72px, 18vh, 160px)',
                            marginBottom: 'clamp(4px, 1.4vh, 16px)',
                          }}
                          className="flex flex-col justify-end px-2"
                        >
                          {cardContent}
                        </div>
                      ) : (
                        <div
                          style={{
                            height: 'clamp(72px, 18vh, 160px)',
                            marginBottom: 'clamp(4px, 1.4vh, 16px)',
                          }}
                        />
                      )}

                      {/* Center Node on the Wave Line */}
                      <div className="relative my-1 flex-shrink-0">
                        <div
                          style={{
                            backgroundColor: isReached ? '#3e4a5c' : '#f6f8fc',
                            borderColor: '#d9e0ff',
                            width: 'clamp(38px, 7vh, 64px)',
                            height: 'clamp(38px, 7vh, 64px)',
                          }}
                          className="clay flex items-center justify-center rounded-full border-2 shadow-2xl transition-transform duration-300 group-hover:scale-110"
                        >
                          <Icon active={isReached} />
                        </div>
                        <span className="absolute -right-1 -top-1 rounded-full border border-[#3e4a5c] bg-white px-2 py-0.5 font-[family-name:var(--font-mono)] text-[10px] font-bold text-[#3e4a5c] shadow-md sm:text-[11px]">
                          {item.step}
                        </span>
                      </div>

                      {/* Bottom Slot */}
                      {isTop ? (
                        <div
                          style={{
                            height: 'clamp(72px, 18vh, 160px)',
                            marginTop: 'clamp(4px, 1.4vh, 16px)',
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            height: 'clamp(72px, 18vh, 160px)',
                            marginTop: 'clamp(4px, 1.4vh, 16px)',
                          }}
                          className="flex flex-col justify-start px-2"
                        >
                          {cardContent}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

function StepGlobeIcon({ active }: { active: boolean }) {
  const stroke = active ? '#d9e0ff' : '#3e4a5c'
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  )
}

function StepLoginIcon({ active }: { active: boolean }) {
  const stroke = active ? '#d9e0ff' : '#3e4a5c'
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m10 17 5-5-5-5" />
      <path d="M15 12H3" />
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    </svg>
  )
}

function StepSelectIcon({ active }: { active: boolean }) {
  const stroke = active ? '#d9e0ff' : '#3e4a5c'
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M13 19a4 4 0 0 0-8 0" />
      <path d="M16 10h2" />
      <path d="M16 14h2" />
      <circle cx="9" cy="12" r="3" />
      <rect x="2" y="5" width="20" height="14" rx="2" />
    </svg>
  )
}

function StepSyncIcon({ active }: { active: boolean }) {
  const stroke = active ? '#d9e0ff' : '#3e4a5c'
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 16V6" />
      <path d="m8 9.5 4-3.5 4 3.5" />
      <path d="M6 18h12" />
    </svg>
  )
}

function StepCameraIcon({ active }: { active: boolean }) {
  const stroke = active ? '#d9e0ff' : '#3e4a5c'
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  )
}

function StepCheckIcon({ active }: { active: boolean }) {
  const stroke = active ? '#d9e0ff' : '#3e4a5c'
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 2v3" />
      <path d="M16 2v3" />
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18" />
      <path d="m9 15 2 2 4-4" />
    </svg>
  )
}

function ChatIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <rect x="3" y="4" width="18" height="13" rx="6" fill="#f6f8fc" />
      <path d="M8 17.5 6.5 21l4.2-3.5" fill="#d9e0ff" />
    </svg>
  )
}

function ListIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <rect x="4" y="5" width="16" height="3.2" rx="1.6" fill="#f6f8fc" />
      <rect x="4" y="10.4" width="12" height="3.2" rx="1.6" fill="#d9e0ff" />
      <rect x="4" y="15.8" width="9" height="3.2" rx="1.6" fill="#e7e4f8" />
    </svg>
  )
}

function KeyIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <circle cx="9" cy="12" r="4.2" fill="#f6f8fc" />
      <path d="M12.5 12H20M17 12v3" stroke="#3e4a5c" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function UploadIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <path d="M12 16V6M8 9.5 12 6l4 3.5" stroke="#3e4a5c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 18h12" stroke="#3e4a5c" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function MediaIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <rect x="3" y="5" width="11" height="9" rx="2.5" fill="#d9e0ff" />
      <rect x="10" y="10" width="11" height="9" rx="2.5" fill="#f6f8fc" />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <path d="M12 5v10M8.5 11.5 12 15l3.5-3.5" stroke="#3e4a5c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 19h12" stroke="#3e4a5c" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function LimitIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <rect x="4" y="6" width="16" height="12" rx="4" fill="#f6f8fc" />
      <text x="12" y="14.5" textAnchor="middle" fontSize="6" fontFamily="ui-monospace, monospace" fill="#3e4a5c">
        2GB
      </text>
    </svg>
  )
}
