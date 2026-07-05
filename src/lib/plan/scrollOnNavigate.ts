import { afterNavigate } from '$app/navigation'
import type { Dayjs } from 'dayjs'
import { isScrollEnd, isScrollStart } from './navigateOnScroll'

type ScrollOnNavigateParams = {
	axis: 'x' | 'y'
	cursor: Dayjs
	hourSize: number
	origin: Dayjs
	onScroll?: () => void
}

export function scrollOnNavigate(node: HTMLElement, params: ScrollOnNavigateParams) {
	afterNavigate(async (navigation) => {
		await navigation.complete
		const { from, to } = navigation
		if (!to) return
		const toActiveElement = getActiveElement(to.url)
		if (toActiveElement) return scrollToActiveElement(toActiveElement)
		if (!from) return scrollToCursor('instant')
		const fromActiveElement = getActiveElement(from.url)
		if (fromActiveElement) return
		if (isScrollStart(node, params.axis)) return scrollToCursor('instant')
		if (isScrollEnd(node, params.axis)) return scrollToCursor('instant')
		scrollToCursor('smooth')
	})

	function getActiveElement(url: URL): HTMLElement | null {
		const periodId = url.searchParams.get('form_period')
		if (!periodId) return null
		return document.getElementById(periodId)
	}

	function scrollToActiveElement(element: HTMLElement) {
		element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' })
	}

	function scrollToCursor(behavior: ScrollBehavior) {
		const offset = params.cursor.diff(params.origin, 'hours') * params.hourSize
		if (params.axis === 'x') node.scroll({ left: offset - node.clientWidth / 4, behavior })
		else node.scroll({ top: offset - node.clientHeight / 4, behavior })
		params.onScroll?.()
	}

	return {
		update(newParams: ScrollOnNavigateParams) {
			params = newParams
		},
	}
}
