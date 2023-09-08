import tippy, { type Props as TippyProps } from 'tippy.js'
import 'tippy.js/dist/tippy.css'

export function tip(
	node: HTMLElement,
	options: Partial<TippyProps> & { disable?: boolean } = { disable: false }
) {
	const { disable, ...tippyProps } = options
	if (disable) return
	const _tip = tippy(node, tippyProps)
	return {
		destroy() {
			_tip.destroy()
		},
	}
}
