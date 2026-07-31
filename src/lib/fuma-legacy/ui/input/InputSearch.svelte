<script lang="ts">
	import type { FocusEventHandler, FormEventHandler, KeyboardEventHandler } from 'svelte/elements'
	import { mdiClose } from '@mdi/js'
	import { browser } from '$app/environment'
	import { page } from '$app/stores'
	import { Icon } from '$lib/fuma-legacy/ui/icon/index.js'
	import { InputText } from '$lib/fuma-legacy/ui/input/index.js'

	interface Props {
		class?: string
		key?: string
		value?: any
		// En mode runes le transfert d'événements passe par des props explicites, comme
		// dans InputText: sans elles, `{oninput}` retomberait sur le global `window.oninput`.
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

<InputText
	{key}
	bind:inputElement
	bind:value
	{onblur}
	{oninput}
	{onkeydown}
	{onkeyup}
	bindWithParams
	input={{
		class: 'input-sm pr-8',
		placeholder: 'Recherche',
		autocomplete: 'off',
		inputmode: 'search',
	}}
	classWrapper="relative {klass}"
>
	{#snippet append()}
		<button
			class="btn btn-square btn-sm absolute right-0"
			class:hidden={!browser}
			style:scale={!!value ? 0.75 : 0}
			onclick={() => {
				value = ''
				inputElement.dispatchEvent(new Event('input', { bubbles: true }))
			}}
			tabindex={!!value ? 0 : -1}
		>
			<Icon path={mdiClose} />
		</button>
	{/snippet}
</InputText>
