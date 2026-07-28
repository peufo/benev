<script lang="ts">
	import type { SuggestionProps } from '@tiptap/suggestion'
	import { SelectorList } from '$lib/fuma-legacy/ui/input/index.js'
	import type { SuggestionItem } from '$lib/fuma-legacy/ui/input/textRich/suggestion.svelte.js'

	interface ComponentProps {
		suggestion: SuggestionProps<SuggestionItem> | undefined
		keyDownEvent?: KeyboardEvent
	}

	// La prop s'appelait `props`, ce qui entrait en conflit avec la rune `$props()`.
	let { suggestion, keyDownEvent }: ComponentProps = $props()

	function handleSelect(index: number) {
		const item = suggestion?.items[index]
		if (!item) return
		suggestion?.command(item)
	}
</script>

<SelectorList
	items={suggestion?.items ?? []}
	{keyDownEvent}
	keyDownPreventDefault={false}
	onSelect={handleSelect}
	class=" max-h-64 overflow-auto"
>
	{#snippet children({ item })}
		<span>{item.label}</span>
	{/snippet}
</SelectorList>
