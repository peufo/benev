<script lang="ts" context="module">
	export type Options = Record<string, { label: string; value?: boolean; options?: Options }>
</script>

<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import { InputBoolean } from '$lib/material/input'
	export let options: Options

	type Events = { setTrue: void }
	const dispatch = createEventDispatcher<Events>()

	function handleChange(newValue: boolean, option: Options[string]) {
		if (newValue === true) dispatch('setTrue')
		else if (option.options) {
			option.options = setFalse(option.options)
		}
	}

	function setFalse(_options?: Options): Options | undefined {
		if (!_options) return undefined
		return Object.entries(_options).reduce<Options>(
			(acc, [key, opt]) => ({
				...acc,
				[key]: {
					label: opt.label,
					value: false,
					options: setFalse(opt.options),
				},
			}),
			{}
		)
	}
</script>

{#each Object.keys(options) as key (key)}
	<InputBoolean
		{key}
		label={options[key].label}
		bind:value={options[key].value}
		on:change={({ detail }) => handleChange(detail, options[key])}
	/>

	{#if options[key].options}
		<div class="flex">
			<div class="ml-3 w-3 -mt-[6px] relative">
				{#each Object.keys(options[key].options || {}) as k, index}
					<div
						style:height="{24 + index * 36}px"
						class="absolute w-3 t-0 border-l-2 border-b-2 bordered rounded-bl-lg"
					/>
				{/each}
			</div>
			<div>
				<svelte:self
					options={options[key].options}
					on:setTrue={() => {
						options[key].value = true
						dispatch('setTrue')
					}}
				/>
			</div>
		</div>
	{/if}
{/each}
