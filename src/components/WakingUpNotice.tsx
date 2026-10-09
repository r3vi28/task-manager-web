import { useIsSlow } from '../hooks/useIsSlow'

// Shown only when a request has been pending for a few seconds.
export default function WakingUpNotice({ active }: { active: boolean }) {
  const isSlow = useIsSlow(active)
  if (!isSlow) return null

  return (
    <p role="status" className="rounded bg-amber-50 px-3 py-2 text-sm text-amber-800">
      Waking up the server… It runs on a free plan and sleeps when idle, so the first request
      can take up to a minute.
    </p>
  )
}
