<script lang="ts">
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import { mdiClose } from '@mdi/js'
	import FormControl from './FormControl.svelte'
	import { type InputProps, type Options, parseOptions } from '.'
	import { DropDown, Icon } from '$lib/material'
	import { urlParam } from '$lib/store'
	import { jsonParse } from '$lib/jsonParse'

	type $$Props = InputProps<string[]> & {
		key: string
		options: Options
		right?: boolean
		btnClass?: string
		badgePrimary?: boolean
	}
	$: ({
		input,
		value: _value,
		options: _1,
		class: klass,
		label,
		right,
		btnClass,
		badgePrimary,
		...props
	} = $$props as $$Props)

	export let key: string
	export let options: Options
	export let value = _value || jsonParse($page.url.searchParams.get(key), [])

	let dropdown: DropDown

	$: _options = parseOptions(options)

	function handleSubmit() {
		if (!dropdown) return
		if (!value.length) {
			goto($urlParam.without(key), { replaceState: true, noScroll: true })
			return
		}
		goto($urlParam.with({ [key]: JSON.stringify(value) }), { replaceState: true, noScroll: true })
	}

	function handleReset() {
		dropdown.hide()
		value = []
		goto($urlParam.without(key), { replaceState: true })
	}
</script>

<input type="hidden" name={key} value={JSON.stringify(value)} />

<DropDown bind:this={dropdown} tippyProps={{ onHide: handleSubmit }} wrapperClass="mb-[-2px]">
	<div class="join" class:ml-2={value.length} slot="activator">
		<button class="btn btn-sm join-item indicator {btnClass || ''}">
			<slot name="label">
				<span>{label}</span>
			</slot>
			{#if value.length > 0}
				<span
					class="
						indicator-item indicator-start badge badge-sm
						{badgePrimary ? 'badge-primary' : 'badge-outline bg-base-100'}
					"
				>
					{value.length}
				</span>
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
		{:else}
			<div class="px-3 py-2 rounded opacity-70">Aucun élément</div>
		{/each}
	</div>
</DropDown>
