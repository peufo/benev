<script lang="ts" context="module">
	import { createSingleton, type Instance as TippyInstance } from 'tippy.js'

	const sigleton = browser
		? createSingleton([], {
				theme: 'dropdown',
				arrow: false,
				moveTransition: 'transform 0.1s ease-out',
				interactive: true,
				interactiveDebounce: 50,
		  })
		: null

	const tips: TippyInstance[] = []
</script>

<script lang="ts">
	import tippy, { type Props as TippyProps } from 'tippy.js'
	import { onMount } from 'svelte'
	import '$lib/material/dropdown.css'
	import { browser } from '$app/environment'
	import { navigating } from '$app/stores'

	export let tippyProps: Partial<TippyProps> = {}
	let klass = ''
	export { klass as class }
	export let wrapperClass = ''
	export let classActivator = ''
	export let useSingleton = false
	export let hideOnBlur = false
	export let hideOnNav = true
	export let tip: TippyInstance | undefined = undefined
	// By pass dropdown for use in flat mode
	export let disable = false
	let activator: HTMLDivElement

	let content: HTMLDivElement

	onMount(() => {
		if (disable) return

		const triggerTarget = activator.querySelector('button, input') || activator

		tip = tippy(activator, {
			content,
			placement: 'bottom-start',
			theme: 'dropdown',
			arrow: false,
			triggerTarget,
			trigger: 'click focus',
			interactive: true,
			interactiveDebounce: 50,
			appendTo: 'parent',
			...tippyProps,
		})

		if (useSingleton) {
			tips.push(tip)
			sigleton?.setInstances(tips)
		}

		const focusables = content.querySelectorAll<HTMLInputElement>(
			'a[href], button, input, textarea, select, details, [tabindex]'
		)
		const lastFocusable = Array.from(focusables).at(-1)
		lastFocusable?.addEventListener('blur', () => {
			if (hideOnBlur) hide()
		})

		const navigatingUnsubscribe = navigating.subscribe((nav) => {
			if (hideOnNav && !nav) hide()
		})

		return () => {
			navigatingUnsubscribe()
			lastFocusable?.removeEventListener('blur', hide)
			if (useSingleton && tip) {
				tips.splice(tips.indexOf(tip), 1)
				tip.destroy()
			}
		}
	})

	export function hide() {
		if (!tip) return
		if (useSingleton) sigleton?.hide()
		else tip.hide()
	}

	export function show() {
		tip?.show()
	}
	export function setTippyProps(props: Partial<TippyProps>) {
		tip?.setProps(props)
	}
</script>

{#if !disable}
	<div class={wrapperClass}>
		<div class={classActivator} bind:this={activator}>
			<slot name="activator" />
		</div>

		<div class="hidden">
			<div
				class="{klass} border rounded-lg p-1 bg-base-100 shadow-lg max-h-80 overflow-auto"
				bind:this={content}
			>
				<slot />
			</div>
		</div>
	</div>
{:else}
	<div class={wrapperClass}>
		<slot name="activator" />
		<div class="{klass} mt-2">
			<slot />
		</div>
	</div>
{/if}
