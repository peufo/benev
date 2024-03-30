<script lang="ts">
	import { getMemberSuggestions } from '$lib/pages/memberSuggestions'
	import { suggestionItems } from '$lib/material/input/textRich/suggestion'

	import PageForm from './PageForm.svelte'

	export let data

	$: suggestionItems.set(
		data.page.type === 'member' ? getMemberSuggestions(data.event.memberFields) : []
	)
</script>

<PageForm page={data.page} charterAlreadyExist={!!data.pages.find((p) => p.type === 'charter')} />
