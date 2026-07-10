import type { AfterNavigate } from '@sveltejs/kit'
import { isScrollEnd, isScrollStart } from './navigateOnScroll'
import type { Plan } from './types'

type ScrollOnNavigateParams = {
	node: HTMLElement
	plan: Plan
	onScroll?: () => void
}

function getActiveElement(url: URL): HTMLElement | null {
	const periodId = url.searchParams.get('form_period')
	if (!periodId) return null
	const element = document.getElementById(periodId)
	if (element) return element
	return document.getElementById('ghost_create_period')
}

function scrollToActiveElement(element: HTMLElement) {
	element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' })
}

function scrollToCursor({ node, plan, onScroll }: ScrollOnNavigateParams) {
	const isScrollStartOrEnd = isScrollStart(node, plan.axis) || isScrollEnd(node, plan.axis)
	const behavior = isScrollStartOrEnd ? 'instant' : 'smooth'
	const offset = plan.cursor.diff(plan.start, 'hours') * plan.hourSize
	if (plan.axis === 'x') {
		node.scroll({ left: offset, behavior })
	} else {
		node.scroll({ top: offset, behavior })
	}
	onScroll?.()
}

export async function scrollOnNavigate(navigation: AfterNavigate, params: ScrollOnNavigateParams) {
	await navigation.complete
	if (!navigation.to) return
	const toActiveElement = getActiveElement(navigation.to.url)
	if (toActiveElement) return scrollToActiveElement(toActiveElement)
	if (isFromOrToForms(navigation)) return
	if (isHourSizeUpdated(navigation)) return
	scrollToCursor(params)
}

const FORMS = ['form_period', 'form_milestone', 'form_team']
function isFromOrToForms(navigation: AfterNavigate): boolean {
	for (const form of FORMS) {
		if (navigation.from?.url.searchParams.has(form)) return true
		if (navigation.to?.url.searchParams.has(form)) return true
	}
	return false
}

function isHourSizeUpdated(navigation: AfterNavigate): boolean {
	const from = navigation.from?.url.searchParams.get('hourSize')
	const to = navigation.to?.url.searchParams.get('hourSize')
	if (!from) return false
	return from !== to
}
