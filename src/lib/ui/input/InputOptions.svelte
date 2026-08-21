<script lang="ts">
	import { PlusIcon, Trash2Icon } from '@lucide/svelte'
	import { slide } from 'svelte/transition'
	import { toast } from 'svelte-sonner'

	import { listEditable, tip } from 'fuma'

	interface Props {
		key: string
		value?: string | undefined | null
	}

	let { key, value = $bindable('[]') }: Props = $props()

	let options: string[] = $state(JSON.parse(value || '[]'))
	let newOption = $state('')
	let optionInput: HTMLInputElement = $state()!

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault()
			createOption()
		}
	}

	function createOption() {
		if (!newOption) return
		if (options.includes(newOption)) return toast.warning('Cette option éxiste déjà !')
		options = [...options, newOption]
		newOption = ''
		value = JSON.stringify(options)
		optionInput.focus()
	}

	function removeOption(index: number) {
		console.log({ index }) // WTF
		options = [...options.slice(0, index), ...options.slice(index + 1)]
		value = JSON.stringify(options)
	}

	function onChange(newOrder: string[]) {
		options = newOrder
		value = JSON.stringify(options)
	}
</script>

<input type="hidden" name={key} {value} />

<div class="label text-xs">Options</div>

<div class="rounded-box border border-soft p-1">
	<div class="flex flex-col gap-1" use:listEditable={{ items: options, onChange }}>
		{#each options as option, index (option)}
			<div class="flex items-center gap-2" transition:slide={{ duration: 200 }}>
				<div class="grow pl-4 text-sm">
					{option}
				</div>
				<button
					type="button"
					class="btn btn-square btn-ghost btn-sm"
					onclick={() => removeOption(index)}
				>
					<Trash2Icon size={16} class="text-error opacity-70" />
				</button>
			</div>
		{/each}
	</div>

	<div class="join flex pt-1">
		<input
			bind:this={optionInput}
			type="text"
			placeholder="Nouvelle option"
			class="input join-item grow"
			bind:value={newOption}
			onkeydown={handleKeyDown}
		/>
		<button
			type="button"
			class="btn btn-square join-item"
			disabled={!newOption}
			onclick={createOption}
		>
			<span class="inline-flex" use:tip={{ content: 'Ajouter' }}><PlusIcon /></span>
		</button>
	</div>
</div>
