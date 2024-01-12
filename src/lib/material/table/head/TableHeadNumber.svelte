<script lang="ts">
	import { DropDown, InputNumber } from '$lib/material'
	import type { TableField } from '../field'

	export let field: TableField

	let min: string | undefined = undefined
	let max: string | undefined = undefined

	let inputMin: string | undefined = undefined
	let inputMax: string | undefined = undefined

	function handleSubmit() {
		console.log(inputMin)
		min = inputMin
		max = inputMax
	}

	function handleReset() {
		min = undefined
		max = undefined
		inputMin = undefined
		inputMax = undefined
	}
</script>

<td>
	<DropDown hideOnBlur tippyProps={{ appendTo: () => document.body }}>
		<button slot="activator" class="menu-item w-full flex-wrap gap-y-1 min-h-8">
			<span>{field.label}</span>

			{#if min !== undefined || max !== undefined}
				<span class="badge badge-primary badge-xs text-[0.7rem] font-normal text-white">
					{#if min !== undefined}
						{min} &lt;
					{/if}
					x
					{#if max !== undefined}
						&lt; {max}
					{/if}
				</span>
			{/if}
		</button>

		<form class="grid gap-2 grid-cols-2 p-1" on:submit|preventDefault={handleSubmit}>
			<InputNumber label="Min" bind:value={inputMin} />
			<InputNumber label="Max" bind:value={inputMax} />
			<div class="col-span-full flex gap-2 justify-end">
				<button class="btn btn-ghost" type="button" on:click={handleReset}>Effacer</button>
				<button class="btn">Valider</button>
			</div>
		</form>
	</DropDown>
</td>
