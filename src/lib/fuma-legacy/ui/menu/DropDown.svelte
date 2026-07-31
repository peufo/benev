<script lang="ts" module>
	import { createSingleton, type TippyInstance } from 'fuma'

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
	import type { Snippet } from 'svelte'
	import { tippy, type TippyProps } from 'fuma'
	import { onMount } from 'svelte'
	import { browser } from '$app/environment'
	import { beforeNavigate } from '$app/navigation'
	import '$lib/fuma-legacy/ui/menu/dropdown.css'

	interface Props {
		tippyProps?: Partial<TippyProps>
		class?: string
		classWrapper?: string
		classActivator?: string
		useSingleton?: boolean
		autofocus?: boolean
		hideOnBlur?: boolean
		hideOnNav?: boolean
		tip?: TippyInstance
		/** Court-circuite le dropdown, pour un rendu à plat. */
		disable?: boolean
		content?: HTMLDivElement
		activator?: Snippet
		children?: Snippet
	}

	let {
		tippyProps = {},
		class: klass = '',
		classWrapper = '',
		classActivator = '',
		useSingleton = false,
		autofocus = false,
		hideOnBlur = false,
		hideOnNav = true,
		tip = $bindable(),
		disable = false,
		content = $bindable(),
		// Renommé à la destructuration: `activator` référence aussi l'élément du DOM.
		activator: activatorSnippet,
		children,
	}: Props = $props()

	let activator: HTMLDivElement = $state()!

	beforeNavigate(() => hideOnNav && hide())

	onMount(() => {
		if (disable) return

		const triggerTarget = activator.querySelector('button, input') || activator
		const focusables = Array.from(
			content!.querySelectorAll<HTMLInputElement>(
				'a[href], button, input, textarea, select, details, [tabindex]'
			)
		)
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
			onShown() {
				if (autofocus) focusables[0]?.select()
			},
			...tippyProps,
		})

		if (useSingleton && tip) {
			tips.push(tip)
			sigleton?.setInstances(tips)
		}

		const lastFocusable = focusables.at(-1)
		if (hideOnBlur) lastFocusable?.addEventListener('blur', hide)

		return () => {
			if (hideOnBlur) lastFocusable?.removeEventListener('blur', hide)
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
	<div class={classWrapper}>
		<div class={classActivator} bind:this={activator}>
			{@render activatorSnippet?.()}
		</div>

		<div class="hidden">
			<div
				class="{klass} max-h-80 overflow-auto rounded-lg border bg-base-100 p-1 shadow-lg"
				bind:this={content}
			>
				{@render children?.()}
			</div>
		</div>
	</div>
{:else}
	<div class={classWrapper}>
		{@render activatorSnippet?.()}
		<div class="{klass} mt-2">
			{@render children?.()}
		</div>
	</div>
{/if}
