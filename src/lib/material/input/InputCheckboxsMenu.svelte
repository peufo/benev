<script lang="ts">
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import { mdiClose } from '@mdi/js'
	import FormControl from './FormControl.svelte'
	import { type InputProps, type Options, parseOptions } from '.'
	import { ButtonMenu, Icon } from '$lib/material'
	import { urlParam } from '$lib/store'
	import { jsonParse } from '$lib/jsonParse'

	type $$Props = InputProps<string[]> & {
		key: string
		options: Options
		labelPlurial: string
		right?: boolean
	}
	$: ({
		input,
		value: _value,
		options: _1,
		class: klass,
		labelPlurial,
		label,
		right,
		...props
	} = $$props as $$Props)

	export let key: string
	export let options: Options
	export let value = _value || jsonParse($page.url.searchParams.get(key), [])

	let menu: ButtonMenu

	$: _options = parseOptions(options)

	function handleSubmit() {
		if (!menu) return
		menu.close()
		if (!value.length) {
			goto($urlParam.without(key), { replaceState: true, noScroll: true })
			return
		}
		goto($urlParam.with({ [key]: JSON.stringify(value) }), { replaceState: true, noScroll: true })
	}

	function handleReset() {
		menu.close()
		value = []
		goto($urlParam.without(key), { replaceState: true })
	}

	const getLabel = (value: string) => _options.find((opt) => opt.value === value)?.label
</script>

<input type="hidden" name={key} value={JSON.stringify(value)} />

<ButtonMenu bind:this={menu} on:mouseLeave={handleSubmit} {right}>
	<div class="join" slot="btn">
		<button class="btn btn-sm join-item" on:click={() => menu.setOpen()}>
			{#if value.length === 0}
				<span>{label || labelPlurial}</span>
			{:else if value.length === 1}
				<span>{getLabel(value[0])}</span>
			{:else}
				<span class="badge badge-lg">{value.length}</span>
				<span>{labelPlurial}</span>
			{/if}
		</button>
		{#if value.length}
			<button class="btn btn-sm btn-square join-item" on:click={handleReset}>
				<Icon path={mdiClose} class="fill-base-content" />
			</button>
		{/if}
	</div>

	<div class={klass}>
		{#each _options as option, index (option.value)}
			<FormControl
				{...props}
				let:key
				label={option.label}
				prefixFor={index}
				class="flex-row-reverse justify-end items-center gap-2 whitespace-nowrap"
			>
				<input
					bind:group={value}
					on:input
					on:focus
					on:blur
					value={option.value}
					type="checkbox"
					id="{index}{key}"
					class="checkbox"
					{...input}
				/>
			</FormControl>
		{/each}
	</div>
</ButtonMenu>
