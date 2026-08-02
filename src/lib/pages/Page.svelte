<script lang="ts">
	import { ButtonCopy, tip } from 'fuma'
	import { LinkIcon, PencilIcon } from '@lucide/svelte'
	import { page as pageStore } from '$app/stores'

	import { eventPath } from '$lib/store/index.js'

	import type { Page } from '@prisma/client'
	import { tiptapParser } from '$lib/ui'

	import type { MemberWithComputedValues } from '$lib/server'
	import PageLayout from './PageLayout.svelte'
	import { getMemberReplacers } from './memberSuggestions'
	import { injectValues } from './injectValues'

	interface Props {
		page: Page | null
		member?: MemberWithComputedValues | undefined
		placeholder?: import('svelte').Snippet
	}

	let { page, member = undefined, placeholder }: Props = $props()

	function getHTML(content: null | undefined | string): string {
		if (!content) return ''
		if (content === 'null') return ''
		return transformPage(tiptapParser.toHTML(content))
	}

	function transformPage(_html: string) {
		if (page?.type !== 'member' || !member) return _html
		const replacers = getMemberReplacers({ member })
		return injectValues(_html, replacers)
	}
	let html = $derived(getHTML(page?.content))
	let canEdit = $derived($pageStore.data.member?.roles.includes('admin'))
</script>

<PageLayout class="relative max-w-2xl py-16">
	{#if html && html !== '<p></p>'}
		<!-- page rédigée par les admins de l'événement dans l'éditeur tiptap -->
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html html}
	{:else}
		{#if placeholder}{@render placeholder()}{:else}
			<div class="text-center p-10">Cette page est vide</div>
		{/if}
	{/if}

	<div class="flex justify-end gap-2 not-prose absolute right-5 top-5">
		{#if canEdit}
			<a
				href="{$eventPath}/admin/pages{page ? `/${page.id}` : ''}"
				class="btn btn-sm btn-square btn-ghost"
			>
				<span class="inline-flex" use:tip={{ content: 'Éditer cette page' }}
					><PencilIcon size={22} /></span
				>
			</a>
		{/if}
		<ButtonCopy
			title="Copier le lien de la page"
			value="https://benev.io{$eventPath}{page ? `/${page.path}` : ''}"
			successMessage="Lien copier"
			Icon={LinkIcon}
		/>
	</div>
</PageLayout>
