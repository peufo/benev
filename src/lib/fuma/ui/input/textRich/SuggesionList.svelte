<!-- @migration-task Error while migrating Svelte code: migrating this component would require adding a `$props` rune but there's already a variable named props.
     Rename the variable and try again or migrate by hand. -->
<script lang="ts">
	import type { SuggestionProps } from '@tiptap/suggestion'
	import { SelectorList } from '$lib/fuma/ui/input/index.js'
	import type { SuggestionItem } from '$lib/fuma/ui/input/textRich/suggestion.js'

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
