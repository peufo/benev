export function initDragStyle(listItemEl: HTMLElement) {
	listItemEl.style.zIndex = `${+listItemEl.style.zIndex + 1}`
	listItemEl.style.top = `${listItemEl.offsetTop}px`
	listItemEl.style.width = `${listItemEl.offsetWidth}px`
	listItemEl.style.height = `${listItemEl.offsetHeight}px`
	listItemEl.style.position = 'absolute'
}

export function resetDragStyle(listItemEl: HTMLElement) {
	listItemEl.style.position = 'initial'
	listItemEl.style.zIndex = `${+listItemEl.style.zIndex - 1}`
	listItemEl.style.transform = ''
	listItemEl.style.width = `auto`
	listItemEl.style.height = `auto`
}
