<script lang="ts">
	import { slide } from 'svelte/transition'
	import { onMount } from 'svelte'
	import { formContext } from '$lib/validation'

	let klass = ''
	export { klass as class }
	export let classLabel = ''
	export let key = ''
	export let label = ''
	export let error = ''
	export let hint = ''
	export let prefix: string | number = ''
	export let prefixFor: string | number = ''
	export let enhanceDisabled = false

	$: _key = prefix && key ? `${prefix}_${key}` : key || ''

	if (!enhanceDisabled) {
		const { setError } = formContext.get()
		setError[key] = (err) => (error = err)
	}

	let formControl: HTMLDivElement
	onMount(() => {
		const input = formControl.querySelector('input, textarea')
		if (!input) return
		const handleInput = () => (error = '')
		input.addEventListener('input', handleInput)
		return () => {
			input.removeEventListener('input', handleInput)
		}
	})
</script>

<div class="form-control {klass}" bind:this={formControl}>
	{#if label || $$slots.label}
		<label for="{prefixFor}{_key}" class="label cursor-pointer {classLabel}">
			<span class="label-text">{label}</span>
			<slot name="label" />
			<slot name="label_append" />
		</label>
	{/if}

	<slot key={_key} />

	{#if error}
		<label for="{prefixFor}{_key}" class="label" transition:slide>
			<span class="label-text-alt text-warning">{error}</span>
		</label>
	{:else if hint}
		<label for="{prefixFor}{_key}" class="label" transition:slide>
			<span class="label-text-alt text-neutral">{hint}</span>
		</label>
	{/if}
</div>
