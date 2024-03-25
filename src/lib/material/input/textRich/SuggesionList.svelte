<script lang="ts">
	import type { SuggestionProps } from '@tiptap/suggestion'
	import { SelectorList } from '$lib/material/input'
	import type { SuggestionItem } from './suggestion'

	export let props: SuggestionProps<SuggestionItem>
	export let keyDownEvent: KeyboardEvent | undefined = undefined

	function handleSelect(index: number) {
		const item = props.items[index]
		if (!item) return
		props.command(item)
	}
</script>

<SelectorList
	items={props.items}
	{keyDownEvent}
	keyDownPreventDefault={false}
	let:item
	on:select={(event) => handleSelect(event.detail)}
	class=" max-h-64 overflow-auto"
>
	<span>{item.label}</span>
</SelectorList>
