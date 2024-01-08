<script lang="ts">
	import { mdiFileDocumentOutline, mdiHomeOutline, mdiPlus } from '@mdi/js'
	import { enhance } from '$app/forms'
	import { page } from '$app/stores'

	import { Icon } from '$lib/material'
	import { eventPath } from '$lib/store'
	import { useForm } from '$lib/validation/index.js'
	import OnlyAdmin from '../OnlyAdmin.svelte'

	export let data

	const form = useForm()

	$: pageIndex = data.pages.find((p) => p.isIndex)
</script>

<OnlyAdmin>
	<div class="flex gap-2 items-center">
		<div class="flex gap-1 overflow-x-auto border p-1 rounded-md">
			{#if pageIndex}
				<a
					href="{$eventPath}/admin/pages/{pageIndex.id}"
					class="menu-item shrink-0"
					class:active={$page.params.pageId === pageIndex.id}
				>
					<Icon path={mdiHomeOutline} class="opacity-60" size={20} />
					<span>{pageIndex.title}</span>
				</a>
			{/if}

			{#each data.pages.filter((p) => !p.isIndex) as { id, title }}
				<a
					href="{$eventPath}/admin/pages/{id}"
					class="menu-item shrink-0"
					class:active={$page.params.pageId === id}
				>
					<Icon path={mdiFileDocumentOutline} class="opacity-60" size={20} />

					<span>{title}</span>
				</a>
			{/each}
		</div>

		<form
			action="{$eventPath}/admin/pages?/create_page"
			method="post"
			class="contents"
			use:enhance={form.submit}
		>
			<button class="btn btn-square btn-sm">
				<Icon path={mdiPlus} title="Ajouter une page" />
			</button>
		</form>
	</div>

	<slot />
</OnlyAdmin>
