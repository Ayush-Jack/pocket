export function Logo({ className = 'h-12 w-12' }: { className?: string }) {
  return <img src="/brand/android-chrome-512x512.png" alt="" className={`${className} shrink-0 object-contain`} />
}
