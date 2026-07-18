import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
}

// Used where the backend genuinely has no endpoint yet, as an honest
// stand-in for what used to be mock fixture data - never silently falls
// back to fabricated rows.
export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center dark:border-slate-700 dark:bg-slate-900/40">
      <Icon size={22} className="mx-auto mb-3 text-slate-400 dark:text-slate-500" />
      <p className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">{title}</p>
      <p className="text-xs leading-5 text-slate-500">{description}</p>
    </div>
  )
}
