<script lang="ts">
	import { slide } from 'svelte/transition'
	import { onMount } from 'svelte'
	import { formContext } from '$lib/form'

	let klass = ''
	export { klass as class }
	export let key: string
	export let label: string
	export let error = ''
	export let hint = ''

	if (formContext.ok()) {
		const { setError } = formContext.get()
		setError[key] = (err) => (error = err)
	} else {
		console.error(
			'Please set "const form = useForm()" and "use:enhance={form.submit}" in form element'
		)
	}

	let formControl: HTMLDivElement
	onMount(() => {
		const input = formControl.querySelector('input')
		if (!input) return
		const handleInput = () => error = ''
		input.addEventListener('input', handleInput)
		return () => {
			input.removeEventListener('input', handleInput)
		}
	})


</script>

<div class="form-control {klass}" bind:this={formControl}>
	<label for={key} class="label">
		<span class="label-text">{label}</span>
	</label>

	<slot {key} />

	{#if error}
		<label for={key} class="label" transition:slide>
			<span class="label-text-alt text-warning">{error}</span>
		</label>
	{:else if hint}
		<label for={key} class="label" transition:slide>
			<span class="label-text-alt text-info">{hint}</span>
		</label>
	{/if}
</div>
