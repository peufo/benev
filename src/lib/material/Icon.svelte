<script lang="ts">
	import tippy, { type Props as TippyProps } from 'tippy.js'
	import { onMount } from 'svelte'
	import 'tippy.js/dist/tippy.css'

	export let path: string
	export let title = ''
	export let size = 24
	let klass = ''
	export { klass as class }
	export let style = ''
	export let classSVG = ''
	export let active = false
	export let tippyProps: Partial<TippyProps> = {}
	export let disableTitlePropagation = false
	const viewWidth = 24
	const viewHeight = 24

	let icon: HTMLElement

	onMount(() => {
		if (!title) return
		const parent = icon.parentElement
		const isButton = parent?.tagName === 'BUTTON' || parent?.tagName === 'A'
		const target = parent && isButton && !disableTitlePropagation ? parent : icon
		const tip = tippy(target || icon, { content: title, ...tippyProps })
		return () => {
			tip.destroy()
		}
	})
</script>

<i
	bind:this={icon}
	class="grid place-content-center {active ? 'fill-base-200' : 'fill-base-content'} {klass}"
	{style}
>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={size}
		height={size}
		viewBox={`0 0 ${viewWidth} ${viewHeight}`}
		style="display: inline-block;"
		class={classSVG}
	>
		<path d={path} />
	</svg>
</i>
