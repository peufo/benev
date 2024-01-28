<script lang="ts">
	import { mdiClose } from '@mdi/js'
	import { Icon, InputText } from '$lib/material'
	import { browser } from '$app/environment'
	import { page } from '$app/stores'

	let klass = ''
	export { klass as class }
	export let key = 'search'
	export let value = $page.url.searchParams.get(key) || ''

	let inputElement: HTMLInputElement
</script>

<InputText
	{key}
	bind:inputElement
	bind:value
	on:blur
	on:blur
	on:input
	on:keydown
	on:keyup
	bindWithParams
	input={{
		class: 'input-sm pr-8',
		placeholder: 'Recherche',
		autocomplete: 'fuck-off',
		inputmode: 'search',
	}}
	wrapperClass="relative {klass}"
>
	<button
		slot="append"
		class="btn btn-square btn-sm absolute right-0"
		class:hidden={!browser}
		style:scale={!!value ? 0.75 : 0}
		on:click={() => {
			value = ''
			inputElement.dispatchEvent(new Event('input', { bubbles: true }))
		}}
		tabindex={!!value ? 0 : -1}
	>
		<Icon path={mdiClose} />
	</button>
</InputText>
