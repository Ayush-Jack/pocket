'use client'

import { useEffect, useRef, useState } from 'react'
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

const HERO_GALLERY_ITEMS = [
  {
    id: 'hg-travel',
    category: 'Travel',
    title: 'Kyoto Bamboo Trail',
    name: 'kyoto-bamboo-morning.jpg',
    size: '18.4 MB',
    msg: 'msg #4812',
    kind: 'Photo',
    tint: 'var(--lilac)',
    imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'hg-food',
    category: 'Food',
    title: 'Tokyo Ramen Bowl',
    name: 'artisan-ramen-tokyo.jpg',
    size: '12.8 MB',
    msg: 'msg #4815',
    kind: 'Photo',
    tint: 'var(--peach)',
    imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'hg-nature',
    category: 'Nature',
    title: 'Dolomites Ridge Pass',
    name: 'dolomites-ridge-fpv.mp4',
    size: '412.0 MB',
    msg: 'msg #4819',
    kind: 'Video · 01:48',
    tint: 'var(--mint)',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'hg-arch',
    category: 'Architecture',
    title: 'Nordic Minimal Cabin',
    name: 'nordic-interior-study.jpg',
    size: '14.2 MB',
    msg: 'msg #4831',
    kind: 'Photo',
    tint: 'var(--accent)',
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=900&q=80',
  },
] as const

export function HeroFlightDeck() {
  const [selectedItem, setSelectedItem] = useState<(typeof HERO_GALLERY_ITEMS)[number]>(HERO_GALLERY_ITEMS[0])
  const [syncPulse, setSyncPulse] = useState(false)

  function cycleNext() {
    setSyncPulse(true)
    const idx = (HERO_GALLERY_ITEMS.findIndex((i) => i.id === selectedItem.id) + 1) % HERO_GALLERY_ITEMS.length
    setSelectedItem(HERO_GALLERY_ITEMS[idx])
    window.setTimeout(() => setSyncPulse(false), 500)
  }

  return (
    <div
      data-hero-reveal=""
      data-tilt="4"
      className="land-well clay-card-alive relative flex flex-col justify-between gap-4 overflow-hidden p-4 sm:p-6"
    >
      {/* Top instrument header */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2">
        <div className="clay-pill gap-2 bg-[var(--clay)] px-3.5 py-1.5 font-[family-name:var(--font-mono)] text-[11px]">
          <span className="relative flex h-2 w-2">
            <span className="pulse-ring absolute inline-flex h-full w-full rounded-full bg-[#4ea885]" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#3b9874]" />
          </span>
          <span>SAVED MESSAGES GALLERY</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {HERO_GALLERY_ITEMS.map((item) => {
            const active = item.id === selectedItem.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedItem(item)}
                className={`rounded-full px-3 py-1 font-[family-name:var(--font-mono)] text-[11px] transition-all ${
                  active
                    ? 'clay-press bg-[var(--accent)] font-medium text-[var(--ink)]'
                    : 'bg-[var(--clay)]/80 text-[var(--muted)] hover:text-[var(--ink)]'
                }`}
              >
                {item.category}
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Featured Visual Card with Real Photography */}
      <div className="clay relative overflow-hidden p-2.5">
        <div className="relative h-56 w-full overflow-hidden rounded-[22px] sm:h-64">
          <img
            key={selectedItem.imageUrl}
            src={selectedItem.imageUrl}
            alt={selectedItem.title}
            className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1f2631]/70 via-transparent to-transparent" />

          <div className="absolute left-3 top-3 flex items-center gap-2">
            <span
              style={{ background: selectedItem.tint }}
              className="clay-pill px-3 py-1 font-[family-name:var(--font-mono)] text-[11px] font-medium text-[var(--ink)]"
            >
              {selectedItem.category}
            </span>
            <span className="clay-pill bg-[var(--clay)]/90 px-2.5 py-1 font-[family-name:var(--font-mono)] text-[10px] text-[var(--ink)]">
              {selectedItem.kind}
            </span>
          </div>

          <div className="absolute inset-x-3.5 bottom-3.5 flex items-end justify-between gap-2 text-white">
            <div>
              <p className="font-[family-name:var(--font-display)] text-lg font-medium leading-tight drop-shadow-xs">
                {selectedItem.title}
              </p>
              <p className="font-[family-name:var(--font-mono)] text-xs text-white/85">
                {selectedItem.name} · {selectedItem.size}
              </p>
            </div>
            <span className="rounded-full bg-white/90 px-3 py-1 font-[family-name:var(--font-mono)] text-[11px] font-medium text-[var(--ink)] shadow-sm">
              {selectedItem.msg}
            </span>
          </div>
        </div>

        {/* Category Photo Strip Thumbnails */}
        <div className="mt-2.5 grid grid-cols-4 gap-2">
          {HERO_GALLERY_ITEMS.map((item) => {
            const active = item.id === selectedItem.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedItem(item)}
                className={`group relative overflow-hidden rounded-2xl p-1 text-left transition-all ${
                  active ? 'bg-[var(--accent)] ring-2 ring-[#3e4a5c]/30' : 'bg-[var(--field)]/70 hover:bg-[var(--field)]'
                }`}
              >
                <div className="h-12 w-full overflow-hidden rounded-xl">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <p className="mt-1 truncate px-1 font-[family-name:var(--font-display)] text-[11px] font-medium text-[var(--ink)]">
                  {item.category}
                </p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Bottom interactive telemetry bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-[var(--clay)]/90 px-3.5 py-2.5 shadow-xs backdrop-blur-xs">
        <div className="flex items-center gap-2.5 text-xs">
          <img
            src={selectedItem.imageUrl}
            alt=""
            className="h-7 w-7 rounded-lg object-cover"
          />
          <div>
            <span className="block font-medium leading-tight text-[var(--ink)]">{selectedItem.name}</span>
            <span className="font-[family-name:var(--font-mono)] text-[10px] text-[var(--muted)]">
              Saved Messages · {selectedItem.size}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={cycleNext}
          className="clay-press rounded-full bg-[var(--field)] px-3.5 py-1.5 font-[family-name:var(--font-mono)] text-[11px] text-[var(--ink)]"
        >
          {syncPulse ? 'Switched ✓' : 'Next photo →'}
        </button>
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

export function WorksInteractiveSection() {
  const [chatMode, setChatMode] = useState<'telegram' | 'pocket'>('telegram')
  const [indexFilter, setIndexFilter] = useState<'all' | 'photo' | 'video' | 'doc'>('all')
  const [inspectLayer, setInspectLayer] = useState<'browser' | 'server'>('browser')

  const indexedRows = [
    {
      name: 'kyoto-bamboo-morning.jpg',
      category: 'Travel',
      size: '18.4 MB',
      type: 'photo',
      img: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=240&q=75',
    },
    {
      name: 'artisan-ramen-tokyo.jpg',
      category: 'Food',
      size: '12.8 MB',
      type: 'photo',
      img: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=240&q=75',
    },
    {
      name: 'dolomites-ridge-fpv.mp4',
      category: 'Travel',
      size: '412 MB',
      type: 'video',
      img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=240&q=75',
    },
    {
      name: 'nordic-architecture-zine.pdf',
      category: 'Architecture',
      size: '14.2 MB',
      type: 'doc',
      img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=240&q=75',
    },
  ].filter((r) => indexFilter === 'all' || r.type === indexFilter)

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
          <h2 className="mt-2.5 font-[family-name:var(--font-display)] text-3xl font-medium leading-none text-[var(--ink)] sm:text-5xl">
            Three parts. One account.
          </h2>
        </div>
        <p className="max-w-md text-sm text-[var(--muted)] sm:text-base">
          Photos, videos, and documents stay in your own Telegram account while Pocket keeps them organized and ready to stream.
        </p>
      </div>

      <ul className="mt-8 grid gap-5 md:grid-cols-3">
        {/* Step 01: Your Telegram (Sign-in & Server-Sealed Session) */}
        <li
          data-reveal-item=""
          data-tilt="5"
          className="clay clay-card-alive flex flex-col justify-between gap-5 p-5 sm:p-6"
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="clay-pill h-12 w-12 justify-center bg-[var(--accent)]">
                  <KeyIcon />
                </span>
                <span className="clay-pill bg-[var(--clay)] px-2.5 py-1 font-[family-name:var(--font-mono)] text-[10px] font-semibold tracking-[0.14em] text-[var(--ink)]">
                  01 · CONNECT
                </span>
              </div>
              <div className="clay-well-sm flex p-1 font-[family-name:var(--font-mono)] text-[11px]">
                <button
                  type="button"
                  onClick={() => setInspectLayer('browser')}
                  className={`rounded-full px-2.5 py-1 transition-all ${
                    inspectLayer === 'browser' ? 'bg-[var(--clay)] text-[var(--ink)] shadow-xs' : 'text-[var(--muted)]'
                  }`}
                >
                  Browser
                </button>
                <button
                  type="button"
                  onClick={() => setInspectLayer('server')}
                  className={`rounded-full px-2.5 py-1 transition-all ${
                    inspectLayer === 'server' ? 'bg-[var(--clay)] text-[var(--ink)] shadow-xs' : 'text-[var(--muted)]'
                  }`}
                >
                  Server
                </button>
              </div>
            </div>

            <div>
              <h3 className="font-[family-name:var(--font-display)] text-2xl font-medium">Your Telegram</h3>
              <p className="mt-2 text-[var(--muted)]">
                Sign in once with your Telegram account. The first sign-in creates Pocket. The browser never sees the session.
              </p>
            </div>
          </div>

          {/* Interactive Micro-Instrument */}
          <div className="clay-well-sm p-3.5 font-[family-name:var(--font-mono)] text-xs">
            {inspectLayer === 'browser' ? (
              <div className="rounded-2xl bg-[var(--mint)] p-3">
                <p className="text-[10px] text-[var(--muted)]">BROWSER STORAGE AUDIT</p>
                <p className="mt-1 font-medium text-[var(--ink)]">0 Telegram keys in browser</p>
                <p className="mt-0.5 text-[11px] text-[var(--muted)]">Only an httpOnly Pocket cookie</p>
              </div>
            ) : (
              <div className="rounded-2xl bg-[var(--accent)] p-3">
                <p className="text-[10px] text-[var(--muted)]">POCKET SERVER ENGINE</p>
                <p className="mt-1 font-medium text-[var(--ink)]">Sealed TDLib session</p>
                <p className="mt-0.5 text-[11px] text-[var(--muted)]">Talks directly to Telegram MTProto</p>
              </div>
            )}
          </div>
        </li>

        {/* Step 02: Saved Messages (Direct Telegram Cloud Storage) */}
        <li
          data-reveal-item=""
          data-tilt="5"
          className="clay clay-card-alive flex flex-col justify-between gap-5 p-5 sm:p-6"
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="clay-pill h-12 w-12 justify-center bg-[var(--lilac)]">
                  <ChatIcon />
                </span>
                <span className="clay-pill bg-[var(--clay)] px-2.5 py-1 font-[family-name:var(--font-mono)] text-[10px] font-semibold tracking-[0.14em] text-[var(--ink)]">
                  02 · STORE
                </span>
              </div>
              <div className="clay-well-sm flex p-1 font-[family-name:var(--font-mono)] text-[11px]">
                <button
                  type="button"
                  onClick={() => setChatMode('telegram')}
                  className={`rounded-full px-2.5 py-1 transition-all ${
                    chatMode === 'telegram' ? 'bg-[var(--clay)] text-[var(--ink)] shadow-xs' : 'text-[var(--muted)]'
                  }`}
                >
                  Telegram
                </button>
                <button
                  type="button"
                  onClick={() => setChatMode('pocket')}
                  className={`rounded-full px-2.5 py-1 transition-all ${
                    chatMode === 'pocket' ? 'bg-[var(--clay)] text-[var(--ink)] shadow-xs' : 'text-[var(--muted)]'
                  }`}
                >
                  Pocket
                </button>
              </div>
            </div>

            <div>
              <h3 className="font-[family-name:var(--font-display)] text-2xl font-medium">Saved Messages</h3>
              <p className="mt-2 text-[var(--muted)]">
                Photos, videos, and documents stay in your own Telegram account. Pocket does not put them in another cloud.
              </p>
            </div>
          </div>

          {/* Interactive Micro-Instrument with Real Photo */}
          <div className="clay-well-sm p-3.5">
            {chatMode === 'telegram' ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between font-[family-name:var(--font-mono)] text-[10px] text-[var(--muted)]">
                  <span>SAVED MESSAGES THREAD</span>
                  <span>msg #4815 · ✓✓</span>
                </div>
                <div className="flex items-center gap-3 rounded-2xl bg-[var(--clay)] p-2.5 shadow-xs">
                  <img
                    src="https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=240&q=75"
                    alt="Ramen bowl"
                    className="h-12 w-12 shrink-0 rounded-xl object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate font-[family-name:var(--font-display)] text-xs font-medium">
                      artisan-ramen-tokyo.jpg
                    </p>
                    <p className="mt-0.5 font-[family-name:var(--font-mono)] text-[10px] text-[var(--muted)]">
                      12.8 MB · Food · Telegram cloud
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3 rounded-2xl bg-[var(--lilac)] p-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src="https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=240&q=75"
                    alt="Ramen bowl"
                    className="h-12 w-12 shrink-0 rounded-xl object-cover"
                  />
                  <div className="min-w-0">
                    <span className="font-[family-name:var(--font-mono)] text-[10px] text-[var(--muted)]">
                      POCKET PICTURE CARD
                    </span>
                    <p className="truncate font-[family-name:var(--font-display)] text-xs font-medium">
                      artisan-ramen-tokyo.jpg
                    </p>
                  </div>
                </div>
                <span className="clay-pill shrink-0 bg-[var(--clay)] px-2.5 py-1 font-[family-name:var(--font-mono)] text-[10px]">
                  Same photo
                </span>
              </div>
            )}
          </div>
        </li>

        {/* Step 03: The list (Smart Index & Instant Stream) */}
        <li
          data-reveal-item=""
          data-tilt="5"
          className="clay clay-card-alive flex flex-col justify-between gap-5 p-5 sm:p-6"
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="clay-pill h-12 w-12 justify-center bg-[var(--mint)]">
                  <ListIcon />
                </span>
                <span className="clay-pill bg-[var(--clay)] px-2.5 py-1 font-[family-name:var(--font-mono)] text-[10px] font-semibold tracking-[0.14em] text-[var(--ink)]">
                  03 · STREAM
                </span>
              </div>
              <div className="flex gap-1 font-[family-name:var(--font-mono)] text-[10px]">
                {(['all', 'photo', 'video', 'doc'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setIndexFilter(t)}
                    className={`rounded-full px-2 py-1 capitalize transition-all ${
                      indexFilter === t ? 'bg-[var(--accent)] text-[var(--ink)]' : 'bg-[var(--field)] text-[var(--muted)]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-[family-name:var(--font-display)] text-2xl font-medium">The list</h3>
              <p className="mt-2 text-[var(--muted)]">
                Pocket keeps the name, size, and type so you can find a file, open it, and download it.
              </p>
            </div>
          </div>

          {/* Interactive Micro-Instrument with Real Thumbnails */}
          <div className="clay-well-sm flex flex-col gap-1.5 p-3">
            {indexedRows.map((row) => (
              <div
                key={row.name}
                className="flex items-center justify-between gap-2 rounded-xl bg-[var(--clay)] px-2.5 py-1.5 text-xs shadow-2xs"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <img src={row.img} alt={row.name} className="h-7 w-7 shrink-0 rounded-lg object-cover" />
                  <span className="truncate font-medium">{row.name}</span>
                </div>
                <span className="shrink-0 font-[family-name:var(--font-mono)] text-[10px] text-[var(--muted)]">
                  {row.size}
                </span>
              </div>
            ))}
          </div>
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
    title: 'Upload',
    description:
      'Choose one file or a whole set of food, travel, or work files. Pocket saves them one after another directly into your Telegram.',
    tag: 'Sequential Queue',
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
    title: 'Photos, videos, documents',
    description:
      'Each kind has its own dedicated section. High-res food & travel photos and 4K videos open automatically as rich picture cards.',
    tag: 'Smart Gallery',
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
    title: 'Open and download',
    description:
      'Open any item to inspect its original filename, category, and Telegram message ID, then stream or download it at full quality.',
    tag: 'Direct Stream',
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
    title: 'Delete, in single click',
    description:
      'Delete removes the file from your Telegram Saved Messages first. Any file over 2 GB is stopped immediately before upload starts.',
    tag: '2 GB Guard',
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
      // Finish all 4 card transitions by 78% of the sticky scroll so Card 04 holds cleanly before unsticking
      return Math.min(1, raw / 0.78)
    }

    // Exact Framer spring parameters (smoothing = 1 -> stiffness: 40, damping: 42, mass: 0.45)
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
        const scrollForce = -40 * (scrollPos - targetScroll) - 42 * scrollVel
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
        height: '450vh',
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
          height: '100vh',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          paddingTop: 'clamp(92px, 11vh, 116px)',
          paddingBottom: 'clamp(14px, 3.5vh, 44px)',
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
            inset: '-15%',
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
          <div className="relative z-20 mx-auto mb-4 w-full max-w-6xl shrink-0 px-4 sm:mb-6 sm:px-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                  FEATURES · SCROLL TO FLIP
                </p>
                <h2
                  data-flight-features=""
                  className="mt-2.5 font-[family-name:var(--font-display)] text-3xl font-medium leading-none text-[var(--ink)] sm:text-5xl"
                >
                  What you can do.
                </h2>
              </div>
              {/* <p className="max-w-md text-sm text-[var(--muted)] sm:text-base">
                Scroll through the deck to explore sequential uploads, smart media galleries, direct streaming, and the 2 GB guard.
              </p> */}
            </div>
          </div>

          {/* 3D Preserve-3D Claymorphic Card Stack Stage */}
          <div
            style={{
              position: 'relative',
              width: 'min(548px, calc(100vw - 32px))',
              height: 'clamp(190px, calc(100vh - 215px), 375px)',
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
                  borderRadius: '32px',
                  background: card.cardGradient,
                  border: '1.5px solid rgba(255, 255, 255, 0.92)',
                  padding: 'clamp(18px, 4%, 36px)',
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
                    className="mt-2.5 grid grid-cols-2 gap-2.5 sm:mt-3.5"
                  >
                    {card.photos.map((photo) => (
                      <div
                        key={photo.label}
                        className="clay-well-sm flex items-center gap-2.5 px-2.5 py-2"
                        style={{
                          background: 'rgba(231, 238, 246, 0.78)',
                          border: '1px solid rgba(255, 255, 255, 0.82)',
                        }}
                      >
                        <img
                          src={photo.src}
                          alt={photo.label}
                          className="h-8 w-10 shrink-0 rounded-xl border border-white/90 object-cover shadow-xs sm:h-10 sm:w-12"
                        />
                        <div className="min-w-0">
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

        {/* Right Side Claymorphic Progress Pill */}
        <div
          className="clay-pill bg-[var(--clay)]/90 px-2.5 py-3.5"
          style={{
            position: 'absolute',
            top: '50%',
            right: '24px',
            transform: 'translateY(-50%)',
            display: 'flex',
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
   // description: 'Start on the Pocket portal on desktop or mobile before entering your personal drive.',
    position: 'bottom' as const,
    tint: 'var(--accent)',
    photo: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=240&q=75',
    // tag: 'Web & Mobile',
    icon: StepGlobeIcon,
  },
  {
    step: '02',
    title: 'Telegram Sign-In',
    // description: 'Register or log in safely using your Telegram phone number, OTP code, and 2FA password.',
    position: 'top' as const,
    tint: 'var(--lilac)',
    photo: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=240&q=75',
    // tag: 'Server-Sealed TDLib',
    icon: StepLoginIcon,
  },
  {
    step: '03',
    title: 'Choose Files',
    // description: 'Pick Food, Travel, Cinema, or Document files up to 2 GB each into your staging list.',
    position: 'bottom' as const,
    tint: 'var(--peach)',
    photo: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=240&q=75',
    // tag: '2 GB Pre-Check',
    icon: StepSelectIcon,
  },
  {
    step: '04',
    title: 'Saved Messages Sync',
    // description: 'Pocket uploads each file one after another directly into your own Telegram Saved Messages.',
    position: 'top' as const,
    tint: 'var(--mint)',
    photo: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=240&q=75',
    // tag: 'Sequential Queue',
    icon: StepSyncIcon,
  },
  {
    step: '05',
    title: 'Picture Card Gallery',
    // description: 'Photos and videos automatically open as rich picture cards organized by category.',
    position: 'bottom' as const,
    tint: 'var(--lilac)',
    photo: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=240&q=75',
    // tag: 'Photos · Videos · Docs',
    icon: StepCameraIcon,
  },
  {
    step: '06',
    title: 'Stream & Manage',
    // description: 'Open any item to inspect its Telegram message ID, stream or download it, or delete it.',
    position: 'top' as const,
    tint: 'var(--accent)',
    photo: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=240&q=75',
    // tag: 'Direct from Telegram',
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

    return () => ctx.revert()
  }, [])

  return (
    <div className="relative z-10 pt-16 sm:pt-24">
      <div ref={triggerRef} className="ambient-field relative z-10 overflow-hidden select-none">
        <section
          id="steps"
          style={{
            paddingTop: 'clamp(92px, 11vh, 116px)',
            paddingBottom: 'clamp(10px, 2.5vh, 32px)',
          }}
          className="relative flex h-screen w-full scroll-mt-20 flex-col items-center justify-start overflow-hidden"
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
                  <h2 className="mt-2.5 font-[family-name:var(--font-display)] text-3xl font-medium leading-none text-[var(--ink)] sm:text-5xl">
                    How to use Pocket.
                  </h2>
                </div>
                <p className="max-w-md text-sm text-[var(--muted)] sm:text-base">
                  Scroll down to see every step in action starting from Step 01 through Step 06.
                </p>
              </div>
            </div>

            {/* Horizontal Scroll Track + Sinusoidal Dashed Wave Path */}
            <div ref={viewportRef} className="relative w-full overflow-hidden py-1 sm:py-3">
              <div
                ref={trackRef}
                className="relative z-10 flex w-max items-center space-x-12 pl-4 pr-48 sm:space-x-20 sm:pl-12 sm:pr-64 md:space-x-28 md:pl-20 md:pr-80"
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
                      className="group flex w-[270px] flex-shrink-0 flex-col items-center text-center sm:w-[320px] md:w-[360px]"
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
