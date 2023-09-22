<script lang="ts">
	import { mdiPlus, mdiTrashCanOutline } from '@mdi/js'
	import { Icon } from '$lib/material'
	import { slide } from 'svelte/transition'
	import { useNotify } from '$lib/notify'
	import { listEditable } from '$lib/action'

	export let key: string
	export let value = '[]'

	let options: string[] = JSON.parse(value)
	let newOption = ''
	let optionInput: HTMLInputElement

	const notify = useNotify()

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault()
			createOption()
		}
	}

	function createOption() {
		if (!newOption) return
		if (options.includes(newOption)) return notify.warning('Cette option éxiste déjà !')
		options = [...options, newOption]
		newOption = ''
		value = JSON.stringify(options)
		optionInput.focus()
	}

	function removeOption(index: number) {
		options = [...options.slice(0, index), ...options.slice(index + 1)]
		value = JSON.stringify(options)
	}

	function onChange(newOrder: string[]) {
		options = newOrder
		value = JSON.stringify(options)
	}
</script>

<input type="hidden" name={key} {value} />

<div class="label">
	<span class="label-text">Options</span>
</div>

<div class="border bordered rounded-box p-2">
	<div use:listEditable={{ items: options, onChange }}>
		{#each options as option, index (option)}
			<div class="flex gap-2 items-center" transition:slide={{ duration: 200 }}>
				<div class="grow pl-4">
					{option}
				</div>
				<button
					type="button"
					class="btn btn-square btn-ghost btn-sm"
					on:click={() => removeOption(index)}
				>
					<Icon path={mdiTrashCanOutline} size={20} class="fill-error" />
				</button>
			</div>
		{/each}
	</div>

	<div class="join flex pt-2">
		<input
			bind:this={optionInput}
			type="text"
			placeholder="Nouvelle option"
			class="input input-bordered grow join-item"
			bind:value={newOption}
			on:keydown={handleKeyDown}
		/>
		<button
			type="button"
			class="btn btn-square join-item"
			disabled={!newOption}
			on:click={createOption}
		>
			<Icon path={mdiPlus} title="Ajouter" />
		</button>
	</div>
</div>
