<script lang="ts">
	import { preventDefault } from 'svelte/legacy'

	import { mdiClipboardTextOutline } from '@mdi/js'
	import { toast } from 'svelte-sonner'
	import { Icon } from '$lib/fuma-legacy/ui/icon/index.js'

	interface Props {
		value: string | (() => Promise<string>)
		title?: string
		label?: string
		icon?: any
		successMessage?: string
		class?: string
		/** Remplace l'évènement `success` de la version Svelte 4. */
		onsuccess?: () => void
	}

	let {
		value: valueOrGetValue,
		title = '',
		label = '',
		icon = mdiClipboardTextOutline,
		successMessage = 'Copied',
		class: klass = '',
		onsuccess,
	}: Props = $props()

	let isLoading = $state(false)

	async function loadValue(): Promise<string> {
		if (typeof valueOrGetValue === 'string') return valueOrGetValue
		return valueOrGetValue()
	}

	async function handleClick() {
		if (isLoading) return
		isLoading = true
		const value = await loadValue().finally(() => (isLoading = false))

		navigator.clipboard
			.writeText(value)
			.then(() => {
				toast.success(successMessage)
				onsuccess?.()
			})
			.catch((error) => {
				toast.error(error)
			})
	}
</script>

<div class="relative">
	{#if isLoading}
		<span class="loading loading-spinner absolute left-1 top-1 scale-125 opacity-25"></span>
	{/if}
	<button
		class={klass ? klass : `btn btn-sm ${label ? '' : ' btn-square'}`}
		onclick={preventDefault(handleClick)}
		class:btn-disabled={isLoading}
	>
		<Icon
			path={icon}
			size={20}
			{title}
			class="transition-transform {isLoading ? 'scale-75' : ''}"
		/>
		{#if label}
			<span>{label}</span>
		{/if}
	</button>
</div>
