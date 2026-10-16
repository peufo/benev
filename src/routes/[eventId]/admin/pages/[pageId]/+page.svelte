<script lang="ts">
	import { ArrowLeftIcon } from '@lucide/svelte'
	import type { Page } from '@prisma/client'
	import { getMemberSuggestions } from '#lib/pages/memberSuggestions.js'
	import { suggestionItems, type SuggestionItem } from '#lib/ui/index.js'
	import { emailSuggestions } from '#lib/pages/emailSuggesions.js'
	import type { EmailEvent } from '#lib/email/models.js'
	import { eventPath } from '#lib/eventPath.js'
	import PageForm from './PageForm.svelte'

	let { data } = $props()

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

	// Les suggestions de l'éditeur riche vivent dans un store lu par l'extension tiptap:
	// elles suivent la publication ouverte.
	$effect(() => {
		suggestionItems.set(getSuggestions(data.page))
	})
</script>

<a href={eventPath('/admin/pages')} class="btn btn-ghost btn-sm my-3 md:hidden">
	<ArrowLeftIcon size={20} class="opacity-70" />
	<span>Toutes les publications</span>
</a>

<section class="surface min-w-0 p-5">
	<PageForm page={data.page} charterAlreadyExist={!!data.pages.find((p) => p.type === 'charter')} />
</section>
