type ScrollTOPeriodOptions = {
	offsetX?: number
	offsetY?: number
}

export function scrollToPeriod(
	node: HTMLElement,
	{ offsetX = 0, offsetY = 0 }: ScrollTOPeriodOptions = {}
) {
	const searchParams = new URLSearchParams(location.href)
	const periodId = searchParams.get('form_period')
	if (!periodId) return
	const periodIdIsCUID = periodId.match(/\w{25}/)
	if (!periodIdIsCUID) return
	const periodEl = document.getElementById(periodId)
	if (!periodEl) return

	const transform = periodEl.style.transform
	const [translateX] = transform.match(/(?<=translateX\()\d+(?=px\))/) || ['0']
	const [translateY] = transform.match(/(?<=translateY\()\d+(?=px\))/) || ['0']

	node?.scroll({
		left: periodEl.offsetLeft + Number(translateX) + offsetX,
		top: periodEl.offsetTop + Number(translateY) + offsetY,
		behavior: 'smooth',
	})
}
