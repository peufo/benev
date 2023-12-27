<script lang="ts">
	import type { Editor } from '@tiptap/core'
	import { mdiChevronDown } from '@mdi/js'
	import { Icon, DropDown } from '$lib/material'

	type Tool = {
		key?: string
		attributes?: {}
		label: string
		icon: string
		action: () => unknown
	}

	export let editor: Editor
	export let tools: Tool[]
	export let hideLabel = false

	let dropdown: DropDown

	function handleClick(tool: Tool) {
		tool.action()
		dropdown.hide()
	}

	$: toolSelected =
		tools.find((t) => {
			if (t.key) return editor.isActive(t.key, t.attributes)
			if (t.attributes) return editor.isActive(t.attributes)
			return false
		}) || tools[0]
</script>

<DropDown
	hideOnBlur
	bind:this={dropdown}
	tippyProps={{
		appendTo: (element) => {
			const wrapper = element.parentElement?.parentElement?.parentElement?.parentElement
			return wrapper || element
		},
	}}
>
	<button slot="activator" type="button" class="menu-item gap-2">
		<Icon path={toolSelected.icon} size={20} class="opacity-70" />
		{#if !hideLabel}
			<span class="font-light text-sm">{toolSelected.label}</span>
		{/if}
		<Icon path={mdiChevronDown} size={20} class="translate-y-[1px] opacity-70" />
	</button>

	{#each tools as tool}
		<button type="button" class="menu-item w-full" on:click={() => handleClick(tool)}>
			<Icon path={tool.icon} size={20} class="opacity-70" />
			<span>
				{tool.label}
			</span>
		</button>
	{/each}
</DropDown>
