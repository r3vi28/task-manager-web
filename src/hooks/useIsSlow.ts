import { useEffect, useState } from 'react'

// True once `active` has stayed true for `delayMs`. Lets us show the
// "waking up the server" hint only when a request is actually slow.
export function useIsSlow(active: boolean, delayMs = 3000) {
  const [isSlow, setIsSlow] = useState(false)

  useEffect(() => {
    if (!active) return
    const id = setTimeout(() => setIsSlow(true), delayMs)
    return () => {
      clearTimeout(id)
      setIsSlow(false)
    }
  }, [active, delayMs])

  return active && isSlow
}
