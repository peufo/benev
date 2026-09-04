<script lang="ts">
	import { SearchIcon } from '@lucide/svelte'
	import type { FocusEventHandler, FormEventHandler, KeyboardEventHandler } from 'svelte/elements'
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
</script>

<label class="input input-sm {klass}">
	<SearchIcon size={16} opacity={0.6} />
	<input
		bind:value
		name={key}
		type="search"
		placeholder="Recherche"
		aria-label="Recherche"
		autocomplete="off"
		inputmode="search"
		{onblur}
		{oninput}
		{onkeydown}
		{onkeyup}
		use:bindValueWithParams={{ bindEnable: true, initValue: (v) => (value = v) }}
	/>
</label>
