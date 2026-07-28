import { cubicOut } from 'svelte/easing'
import type { FlyParams, TransitionConfig } from 'svelte/transition'

export type DrawerFlyParams = FlyParams & {
	onTransition?: (pos: { x: number; y: number }) => unknown
}

export function drawerFly(
	node: HTMLElement,
	{
		delay = 0,
		duration = 400,
		easing = cubicOut,
		x = 0,
		y = 0,
		opacity = 0,
		onTransition = () => {},
	}: DrawerFlyParams = {}
): TransitionConfig {
	const style = getComputedStyle(node)
	const target_opacity = +style.opacity
	const transform = style.transform === 'none' ? '' : style.transform
	const od = target_opacity * (1 - opacity)
	const [xValue, xUnit] = split_css_unit(x)
	const [yValue, yUnit] = split_css_unit(y)
	return {
		delay,
		duration,
		easing,
		css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * xValue}${xUnit}, ${(1 - t) * yValue}${yUnit});
			opacity: ${target_opacity - od * u}`,
		tick: (t, u) => {
			onTransition({ x: t * xValue, y: t * yValue })
		},
	}
}

export function split_css_unit(value: number | string): [number, string] {
	const split = typeof value === 'string' && value.match(/^\s*(-?[\d.]+)([^\s]*)\s*$/)
	return split ? [parseFloat(split[1]), split[2] || 'px'] : [value as number, 'px']
}
