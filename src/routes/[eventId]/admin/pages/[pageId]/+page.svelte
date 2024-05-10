<script lang="ts">
	import { getMemberSuggestions } from '$lib/pages/memberSuggestions'
	import { suggestionItems, type SuggestionItem } from 'fuma'

	import PageForm from './PageForm.svelte'
	import type { Page } from '@prisma/client'
	import { emailSuggestions } from '$lib/pages/emailSuggesions'
	import type { EmailEvent } from '$lib/email/models'

	export let data

	$: suggestionItems.set(getSuggestions(data.page))

	function getSuggestions(page: Page): SuggestionItem[] {
		if (page.type === 'member') return getMemberSuggestions(data.event.memberFields)
		if (page.type !== 'email') return []
		const path = page.path as EmailEvent
		const suggestions = [
			...emailSuggestions[path],
			...getMemberSuggestions(data.event.memberFields),
		]
		return suggestions || []
	}
</script>

<PageForm page={data.page} charterAlreadyExist={!!data.pages.find((p) => p.type === 'charter')} />
