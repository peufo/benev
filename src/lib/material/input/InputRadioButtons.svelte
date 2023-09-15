<script lang="ts">
	import type { FormEventHandler, HTMLInputAttributes } from 'svelte/elements'
	import { bindCheckedWithParams } from './action'

	let klass = ''
	export { klass as class }
	export let key: string
	export let value = ''
	export let options: Record<string, string>
	export let input: HTMLInputAttributes | undefined = undefined
	export let bindWithParams = false

	$: ({ class: inputClass, ...inputProps } = input || {})

	const handleClick: FormEventHandler<HTMLInputElement> = (event) => {
		const target = event.target as HTMLInputElement
		target.checked = value !== target.value
		if (!target.checked) value = ''
	}
</script>

<div class="join {klass}">
	{#each Object.entries(options) as [v, label]}
		<input
			use:bindCheckedWithParams={{
				bindEnable: bindWithParams,
				listenerType: 'click',
				initValue: (initialValue) => (value = initialValue),
			}}
			bind:group={value}
			on:click={handleClick}
			value={v}
			type="radio"
			name={key}
			class="join-item btn btn-sm {inputClass}"
			aria-label={label}
			{...inputProps}
		/>
	{/each}
</div>
