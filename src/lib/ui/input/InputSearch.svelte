<script lang="ts">
	import { XIcon } from '@lucide/svelte'
	import type { FocusEventHandler, FormEventHandler, KeyboardEventHandler } from 'svelte/elements'
	import { browser } from '$app/env'
	import { page } from '$app/stores'
	import { bindValueWithParams } from './action.js'

	interface Props {
		class?: string
		key?: string
		value?: string
		// En mode runes le transfert d'événements passe par des props explicites: sans elles,
		// `{oninput}` retomberait sur le global `window.oninput`.
		oninput?: FormEventHandler<HTMLInputElement>
		onblur?: FocusEventHandler<HTMLInputElement>
		onkeydown?: KeyboardEventHandler<HTMLInputElement>
		onkeyup?: KeyboardEventHandler<HTMLInputElement>
	}

	let {
		class: klass = '',
		key = 'search',
		value = $bindable($page.url.searchParams.get(key) || ''),
		oninput,
		onblur,
		onkeydown,
		onkeyup,
	}: Props = $props()

	let inputElement: HTMLInputElement = $state()!
</script>

<div class="relative {klass}">
	<input
		bind:this={inputElement}
		bind:value
		name={key}
		type="text"
		class="input input-sm w-full pr-8"
		placeholder="Recherche"
		autocomplete="off"
		inputmode="search"
		{onblur}
		{oninput}
		{onkeydown}
		{onkeyup}
		use:bindValueWithParams={{ bindEnable: true, initValue: (v) => (value = v) }}
	/>

	<button
		class="btn btn-square btn-sm absolute right-0"
		class:hidden={!browser}
		style:scale={value ? 0.75 : 0}
		onclick={() => {
			value = ''
			inputElement.dispatchEvent(new Event('input', { bubbles: true }))
		}}
		tabindex={value ? 0 : -1}
	>
		<XIcon />
	</button>
</div>
