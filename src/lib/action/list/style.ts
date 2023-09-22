export function initDragStyle(dragEl: HTMLElement) {
	dragEl.style.zIndex = `${+dragEl.style.zIndex + 1}`
	dragEl.style.top = `${dragEl.offsetTop}px`
	dragEl.style.width = `${dragEl.offsetWidth}px`
	dragEl.style.height = `${dragEl.offsetHeight}px`
	dragEl.style.position = 'absolute'
}

export function resetDragStyle(dragEl: HTMLElement) {
	dragEl.style.position = 'initial'
	dragEl.style.zIndex = `${+dragEl.style.zIndex - 1}`
	dragEl.style.transform = ''
	dragEl.style.width = `auto`
	dragEl.style.height = `auto`
}
