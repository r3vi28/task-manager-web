// Shows the first validation message the API returned for a field.
export default function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null

  return <span className="mt-1 block text-sm font-normal text-red-600">{messages[0]}</span>
}
