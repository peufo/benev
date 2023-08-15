<script lang="ts">
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import FormControl from './FormControl.svelte'
	import type { InputProps } from '.'
	import { ButtonMenu, Icon } from '$lib/material'
	import { mdiClose } from '@mdi/js'
	import { urlParam } from '$lib/store'

	type Options = string[] | { value: string; label: string }[]

	type $$Props = InputProps<string[]> & { options: Options; labelPlurial: string; key: string }
	$: ({ input, value: _value, options: _1, class: klass, ...props } = $$props as $$Props)

	export let key: string
	export let options: Options
	export let value = _value || JSON.parse($page.url.searchParams.get(key) || '[]')

	let menu: ButtonMenu

	$: _options = options.map((opt) => (typeof opt === 'string' ? { value: opt, label: opt } : opt))

	function handleSubmit() {
		menu.close()
		if (!value.length) {
			goto($urlParam.without(key), { replaceState: true })
			return
		}
		goto($urlParam.with({ [key]: JSON.stringify(value) }), { replaceState: true })
	}

	function handleReset() {
		menu.close()
		value = []
		goto($urlParam.without(key), { replaceState: true })
	}
</script>

<input type="hidden" name={key} value={JSON.stringify(value)} />

<ButtonMenu bind:this={menu} on:mouseLeave={handleSubmit}>
	<div class="join" slot="btn">
		<button class="btn join-item" on:click={() => menu.setOpen()}>
			{#if value.length === 0}
				<span>Tous les {props.labelPlurial}</span>
			{:else}
				<span class="badge badge-lg">{value.length}</span>
				<span>
					{value.length > 1 ? props.labelPlurial : props.label}
				</span>
			{/if}
		</button>
		{#if value.length}
			<button class="btn btn-square join-item" on:click={handleReset}>
				<Icon path={mdiClose} class="fill-error" />
			</button>
		{/if}
	</div>

	<div class="{klass} p-2">
		{#each _options as option, index}
			<FormControl
				{...props}
				let:key
				label={option.label}
				prefixFor={index}
				class="flex-row-reverse justify-end items-center gap-2"
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
