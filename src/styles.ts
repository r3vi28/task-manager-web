// Tailwind class strings shared across components.
// Each one carries its dark: variant, so dark mode follows the OS setting with no extra code.

export const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-indigo-400 dark:focus-visible:ring-offset-slate-900'

export const cardClass =
  'rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900'

export const mutedTextClass = 'text-slate-600 dark:text-slate-400'

export const labelClass = 'block text-sm font-medium text-slate-700 dark:text-slate-300'

export const optionalHintClass = 'font-normal text-slate-500 dark:text-slate-400'

export const inputClass =
  'mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400'

const buttonBase = `inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`

// White on indigo-600 keeps a 4.5:1+ contrast ratio in both themes.
export const primaryButtonClass = `${buttonBase} bg-indigo-600 text-white shadow-sm hover:bg-indigo-700`

export const secondaryButtonClass = `${buttonBase} border border-slate-300 bg-white text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800`

// Small borderless buttons for secondary actions. The caller adds the text color.
export const ghostButtonClass = `inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-slate-800 ${focusRing}`
