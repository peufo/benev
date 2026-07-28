import { tippy, type TippyProps, type TippyInstance } from '$lib/fuma/utils/tippy.js'

type TipOptions = Partial<TippyProps> & { disable?: boolean }

export function tip(node: HTMLElement, options: TipOptions = { disable: false }) {
	let _tip: TippyInstance | null = null
	init(options)
	function init({ disable, ...tippyProps }: TipOptions) {
		_tip = disable ? null : tippy(node, tippyProps)
	}

	return {
		destroy() {
			_tip?.destroy()
		},
		update(newOptions: TipOptions) {
			_tip?.destroy()
			init(newOptions)
		},
	}
}
