// Tailwind class strings shared by forms across pages.

export const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400'

export const inputClass =
  'mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 font-normal focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200'

export const primaryButtonClass = `rounded bg-indigo-600 px-3 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-60 ${focusRing}`

export const secondaryButtonClass = `rounded border border-slate-300 bg-white px-3 py-2 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60 ${focusRing}`
