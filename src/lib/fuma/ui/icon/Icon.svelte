<script lang="ts">
	import { run } from 'svelte/legacy'

	import { tippy, type TippyProps, type TippyInstance } from '$lib/fuma/utils/tippy.js'
	import { onMount } from 'svelte'

	interface Props {
		path: string
		title?: string
		size?: number
		class?: string
		style?: string
		classSVG?: string
		tippyProps?: Partial<TippyProps>
		disableTitlePropagation?: boolean
	}

	let {
		path,
		title = '',
		size = 22,
		class: klass = '',
		style = '',
		classSVG = '',
		tippyProps = {},
		disableTitlePropagation = false,
	}: Props = $props()
	const viewWidth = 24
	const viewHeight = 24

	let icon: HTMLElement = $state()

	let tip: TippyInstance | null = $state(null)
	run(() => {
		tip?.setContent(title)
	})

	onMount(() => {
		if (!title) return
		const parent = icon.parentElement
		const isButton = parent?.tagName === 'BUTTON' || parent?.tagName === 'A'
		const target = parent && isButton && !disableTitlePropagation ? parent : icon
		tip = tippy(target || icon, {
			content: title,
			trigger: 'mouseenter',
			...tippyProps,
		})
		return () => {
			tip?.destroy()
		}
	})
</script>

<i bind:this={icon} class="grid place-content-center fill-base-content {klass}" {style}>
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
