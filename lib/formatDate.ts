export function formatDate(dateInput: Date | string | null | undefined) {
  if (!dateInput) return '-'

  return new Date(dateInput).toLocaleString('th-TH', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}