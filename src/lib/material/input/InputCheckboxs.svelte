<script lang="ts">
	import FormControl from './FormControl.svelte'
	import type { InputProps } from '.'
	type Options = string[] | { value: string; label: string }[]

	type $$Props = InputProps<string[]> & { options: Options, checkboxesClass?: string }
	$: ({ input, value: _value, options: _1, class: klass, checkboxesClass, ...props } = $$props as $$Props)
	export let value = _value || []
	export let options: Options

	$: _options = options.map((opt) => (typeof opt === 'string' ? { value: opt, label: opt } : opt))

</script>

<input type="hidden" name={props.key} value={JSON.stringify(value)}>

<div class={klass}>
	<div class="label">
		<span class="label-text">{props.label}</span>
	</div>

	<div class={checkboxesClass}>
		{#each _options as option, index} 
			<FormControl
				{...props}
				let:key
				label={option.label}
				prefix="ignored"
				prefixFor={index}
				class="flex-row-reverse justify-end items-center gap-2"
			>
				<input
					bind:group={value}
					on:change
					on:input
					on:focus
					on:blur
					value={option.value}
					type="checkbox"
					name={key}
					id="{index}{key}"
					class="checkbox"
					{...input}
				/>
			</FormControl>
		{/each}

	</div>
</div>
