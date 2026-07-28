<!-- @migration-task Error while migrating Svelte code: $$props is used together with named props in a way that cannot be automatically migrated. -->
<script lang="ts">
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import { mdiClose } from '@mdi/js'

	import { urlParam } from '$lib/fuma/store/index.js'
	import { jsonParse, type Options, parseOptions } from '$lib/fuma/utils/index.js'
	import { Icon } from '$lib/fuma/ui/icon/index.js'
	import { DropDown } from '$lib/fuma/ui/menu/index.js'
	import { FormControl, type InputProps } from '$lib/fuma/ui/input/index.js'

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
	export let value: string[] | null | undefined =
		_value || jsonParse($page.url.searchParams.get(key), [])

	let dropdown: DropDown

	$: _options = parseOptions(options)

	async function writeUrl() {
		const url = value?.length
			? $urlParam.with({ [key]: JSON.stringify(value) })
			: $urlParam.without(key)
		return goto(url, { replaceState: true, noScroll: true })
	}

	function handleReset() {
		dropdown.hide()
		value = []
		goto($urlParam.without(key), { replaceState: true })
	}
</script>

<input type="hidden" name={key} value={JSON.stringify(value)} />

<DropDown bind:this={dropdown} tippyProps={{ onHidden: writeUrl }} classWrapper="mb-[-2px]">
	<div class="join" class:ml-2={value?.length} slot="activator">
		<button class="btn indicator join-item btn-sm {btnClass || ''}">
			<slot name="label">
				<span>{label}</span>
			</slot>
			{#if !!value?.length}
				<span
					class="
						badge indicator-item badge-sm indicator-start
						{badgePrimary ? 'badge-primary' : 'badge-outline bg-base-100'}
					"
				>
					{value?.length}
				</span>
			{/if}
		</button>
		{#if !!value?.length}
			<button class="btn btn-square join-item btn-sm" on:click={handleReset}>
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
				class="flex-row-reverse items-center justify-end gap-2 whitespace-nowrap"
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
