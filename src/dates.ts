// A due date is a calendar day, but the API only accepts a UTC ISO instant ("...Z").
// We send the day at 12:00 UTC and always display it in UTC, so the day the user
// picked never shifts because of their timezone.

// "2026-10-09" (from <input type="date">) -> "2026-10-09T12:00:00.000Z"
export function toApiDate(day: string): string | undefined {
  if (!day) return undefined
  return new Date(`${day}T12:00:00Z`).toISOString()
}

// "2026-10-09T12:00:00.000Z" -> "2026-10-09"
export function toDateInputValue(iso: string | null): string {
  return iso ? iso.slice(0, 10) : ''
}

// "2026-10-09T12:00:00.000Z" -> "Oct 9, 2026"
export function formatDueDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
