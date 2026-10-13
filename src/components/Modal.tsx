import { useEffect, useId, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import { focusRing } from '../styles'

interface ModalProps {
  title: string
  onClose: () => void
  children: ReactNode
}

// The parent renders <Modal> to open it and stops rendering it to close it,
// so the form inside always starts fresh and there is no open/closed prop to sync.
export default function Modal({ title, onClose, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  // Captured on the first render, before focus moves into the dialog:
  // this is the button that opened the modal.
  const [opener] = useState(() => document.activeElement)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    // showModal() gives us the backdrop, a focus trap, an inert page and Escape to close.
    // The guard avoids calling it twice when StrictMode re-runs the effect in development.
    if (!dialog.open) dialog.showModal()
    dialog.querySelector<HTMLElement>('input, select, textarea')?.focus()

    return () => {
      if (opener instanceof HTMLElement) opener.focus()
    }
  }, [opener])

  // The dialog box has no padding of its own, so a click whose target is the
  // <dialog> element itself can only be a click on the backdrop.
  function handleMouseDown(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) onClose()
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      // Fires when the browser closes the dialog itself (Escape).
      onClose={onClose}
      onMouseDown={handleMouseDown}
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-lg bg-white p-0 text-slate-900 shadow-xl backdrop:bg-slate-900/50"
    >
      <div className="max-h-[85dvh] overflow-y-auto p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id={titleId} className="text-lg font-semibold">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className={`rounded px-2 text-xl leading-8 text-slate-500 hover:bg-slate-100 hover:text-slate-700 ${focusRing}`}
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </dialog>
  )
}
