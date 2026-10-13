import { cardClass } from '../styles'

interface SkeletonListProps {
  count: number
  label: string // read by screen readers instead of the placeholder shapes
  className?: string // layout of the list, e.g. a grid
}

// Placeholder cards with the shape of the real content, shown while a list loads.
export default function SkeletonList({ count, label, className }: SkeletonListProps) {
  return (
    <div role="status" className={className}>
      <span className="sr-only">{label}</span>
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          aria-hidden="true"
          className={`${cardClass} animate-pulse p-5 motion-reduce:animate-none`}
        >
          <div className="h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="mt-3 h-3 w-5/6 rounded bg-slate-100 dark:bg-slate-800/70" />
          <div className="mt-5 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800/70" />
        </div>
      ))}
    </div>
  )
}
