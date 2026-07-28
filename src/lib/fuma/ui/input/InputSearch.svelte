<script lang="ts">
	import { mdiClose } from '@mdi/js'
	import { browser } from '$app/environment'
	import { page } from '$app/stores'
	import { Icon } from '$lib/fuma/ui/icon/index.js'
	import { InputText } from '$lib/fuma/ui/input/index.js'

	
	interface Props {
		class?: string;
		key?: string;
		value?: any;
	}

	let { class: klass = '', key = 'search', value = $bindable($page.url.searchParams.get(key) || '') }: Props = $props();

	let inputElement: HTMLInputElement = $state()
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
