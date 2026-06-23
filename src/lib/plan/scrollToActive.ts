import { page } from '$app/state'

export function scrollToActive() {
	const periodId = page.url.searchParams.get('form_period')
	if (!periodId) return
	const activeElement = document.getElementById(periodId)
	if (!activeElement) return
	activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' })
}
