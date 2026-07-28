<!-- @migration-task Error while migrating Svelte code: $$props is used together with named props in a way that cannot be automatically migrated. -->
<script lang="ts">
	import { slide } from 'svelte/transition'
	import { FormControl, type InputProps } from '$lib/fuma/ui/input/index.js'
	import { type Options, parseOptions } from '$lib/fuma/utils/options.js'

	type $$Props = InputProps<string[]> & { options: Options; checkboxesClass?: string }
	$: ({
		input,
		value: _value,
		options: _1,
		class: klass,
		checkboxesClass,
		hint,
		error,
		...props
	} = $$props as $$Props)
	export let value: string[] | null | undefined = _value || []
	export let options: Options

	if (!value) value = []

	$: _options = parseOptions(options)
</script>

<div class={klass}>
	{#if props.label}
		<div class="label">
			<span class="label-text">{props.label}</span>
			<slot name="label_append" />
		</div>
	{/if}

	<div class={checkboxesClass}>
		{#each _options as option, index}
			<FormControl
				{...props}
				let:key
				label={option.label}
				prefixFor={index}
				class="flex-row-reverse items-center justify-end gap-2"
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

	{#if error}
		<div class="label" transition:slide>
			<span class="label-text-alt text-warning">{error}</span>
		</div>
	{:else if hint}
		<div class="label" transition:slide>
			<span class="label-text-alt text-info">{hint}</span>
		</div>
	{/if}
</div>

<input type="hidden" name={props.key} value={JSON.stringify(value)} />
