<script lang="ts">
	import { mdiClose } from '@mdi/js'
	import { Icon, InputText } from '$lib/material'
	import { browser } from '$app/environment'

	export let value: string | undefined = undefined
	let klass = ''
	export { klass as class }

	let inputElement: HTMLInputElement
</script>

<InputText
	key="search"
	bind:inputElement
	bind:value
	bindWithParams
	input={{
		class: 'input-sm pr-8',
		placeholder: 'Recherche',
		autocomplete: 'off',
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
