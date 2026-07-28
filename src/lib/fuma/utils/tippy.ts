import 'tippy.js/dist/tippy.css'
import tippyBadTyped, {
	type Tippy,
	type Props as TippyProps,
	type Instance as TippyInstance,
	hideAll,
	delegate,
	createSingleton,
	animateFill,
	followCursor,
	inlinePositioning,
	sticky,
	roundArrow,
} from 'tippy.js'

export const tippy = tippyBadTyped as unknown as Tippy
export type { TippyProps, TippyInstance }
export {
	hideAll,
	delegate,
	createSingleton,
	animateFill,
	followCursor,
	inlinePositioning,
	sticky,
	roundArrow,
}
