<script lang="ts">
	import { ChevronDownIcon, type IconProps } from '@lucide/svelte'
	import type { Editor } from '@tiptap/core'

	import { DropDown } from 'fuma'
	import type { Component } from 'svelte'

	type Tool = {
		key?: string
		attributes?: Record<string, unknown>
		label: string
		icon: Component<IconProps>
		action: () => unknown
		newSection?: true
		disable?: boolean
	}

	interface Props {
		editor: Editor
		tools: Tool[]
		hideLabel?: boolean
		/** Nom accessible du déclencheur, quand l'icône seule ne dit rien. */
		label?: string
		activator?: import('svelte').Snippet
	}

	let { editor, tools, hideLabel = false, label, activator }: Props = $props()

	let dropdown: DropDown = $state()!

	function handleClick(tool: Tool) {
		tool.action()
		dropdown.hide()
	}

	let toolSelected = $derived(
		tools.find((t) => {
			if (t.key) return editor.isActive(t.key, t.attributes)
			if (t.attributes) return editor.isActive(t.attributes)
			return false
		}) || tools[0]
	)

	const activator_render = $derived(activator)
	const IconSelected = $derived(toolSelected.icon)
</script>

<DropDown hideOnBlur bind:this={dropdown}>
	{#snippet activator()}
		<button type="button" class="menu-item gap-2" aria-label={label}>
			{#if activator_render}{@render activator_render()}{:else}
				<IconSelected size={20} class="opacity-70" />
				{#if !hideLabel}
					<span class="text-sm font-light">{toolSelected.label}</span>
				{/if}
			{/if}
			<ChevronDownIcon size={20} class="translate-y-[1px] opacity-70" />
		</button>
	{/snippet}

	{#each tools as tool (tool.label)}
		{@const ToolIcon = tool.icon}
		{#if tool.newSection}
			<hr class="my-2" />
		{/if}
		<button
			disabled={tool.disable}
			type="button"
			class="menu-item w-full"
			class:disabled={tool.disable}
			class:opacity-60={tool.disable}
			onclick={() => handleClick(tool)}
		>
			<ToolIcon size={20} class="opacity-70" />
			<span>
				{tool.label}
			</span>
		</button>
	{/each}
</DropDown>
