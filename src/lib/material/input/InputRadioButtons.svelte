<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements'
	import { bindCheckedWithParams } from './action'

  let klass = ''
  export {klass as class}
  export let key: string
	export let value = ''
	export let options: Record<string, string>
  export let input: HTMLInputAttributes | undefined = undefined
  export let bindWithParams = false

  $: ({class: inputClass, ...inputProps} = input || {})
</script>

<div class="join {klass}">
	{#each Object.entries(options) as [v, label]}
		<input
			use:bindCheckedWithParams={{ bindEnable: bindWithParams }}
			bind:group={value}
			on:input
			on:focus
			on:blur
			value={v}
			type="radio"
			name={key}
			class="join-item btn {inputClass}"
			aria-label={label}
			{...inputProps}
		/>
	{/each}
</div>
