import type { ReactNode } from 'react'
import { mutedTextClass } from '../styles'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-xl border-2 border-dashed border-slate-300 px-6 py-12 text-center dark:border-slate-700">
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
        {icon}
      </div>
      <p className="mt-4 font-semibold">{title}</p>
      <p className={`mt-1 text-sm ${mutedTextClass}`}>{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
