<script lang="ts">
	import { slide } from 'svelte/transition'
	import { formContext } from '$lib/form'

	let klass = ''
	export { klass as class }
	export let key: string
	export let label: string
	export let error = ''

	const { setError } = formContext.get()
	setError[key] = (err) => (error = err)
</script>

<div class="form-control {klass}">
	<label for={key} class="label">
		<span class="label-text">{label}</span>
	</label>

	<slot {key} />

	{#if error}
		<label for={key} class="label" transition:slide>
			<span class="label-text-alt text-warning">{error}</span>
		</label>
	{/if}
</div>
