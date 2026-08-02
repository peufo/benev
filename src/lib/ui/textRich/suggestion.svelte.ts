import type { SuggestionOptions } from '@tiptap/suggestion'
import { writable, get } from 'svelte/store'
import { tippy, type TippyInstance } from 'fuma'

import SuggesionList from '$lib/ui/textRich/SuggesionList.svelte'
import { mount, unmount } from 'svelte'
import type { SuggestionProps } from '@tiptap/suggestion'

export type SuggestionItem = { id: string; label: string }
export const suggestionItems = writable<SuggestionItem[]>([])

export const suggestion: Omit<SuggestionOptions<SuggestionItem>, 'editor'> = {
	items: ({ query }) => {
		const items = get(suggestionItems)
		return items.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()))
	},

	render: () => {
		let popup: TippyInstance
		const target = document.createElement('div')
		let component: ReturnType<typeof mount> | undefined

		// Svelte 5: `mount()` renvoie les exports du composant, pas une instance avec
		// `$set`/`$destroy`. Les mises à jour passent par un objet de props réactif.
		const props = $state<{
			suggestion: SuggestionProps<SuggestionItem> | undefined
			keyDownEvent: KeyboardEvent | undefined
		}>({ suggestion: undefined, keyDownEvent: undefined })

		return {
			onStart: (startProps) => {
				props.suggestion = startProps
				component = mount(SuggesionList, { target, props })
				if (!startProps.clientRect) return

				popup = tippy(document.body, {
					getReferenceClientRect: startProps.clientRect as () => DOMRect,
					appendTo: () => document.body,
					content: target,
					showOnCreate: true,
					interactive: true,
					trigger: 'manual',
					placement: 'bottom-start',
					theme: 'dropdown-border',
				})
			},

			onUpdate(updateProps) {
				props.suggestion = updateProps
				if (!updateProps.clientRect) return

				popup.setProps({
					getReferenceClientRect: updateProps.clientRect as () => DOMRect,
				})
			},

			onKeyDown(keyProps) {
				if (keyProps.event.key === 'Escape') {
					popup.hide()
					return true
				}
				if (['Enter', 'ArrowUp', 'ArrowDown'].includes(keyProps.event.key)) {
					props.keyDownEvent = keyProps.event
					return true
				}
				return false
			},

			onExit() {
				popup?.destroy()
				if (component) unmount(component)
			},
		}
	},
}
