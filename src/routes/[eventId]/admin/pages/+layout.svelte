<script lang="ts">
	import { mdiFileDocumentOutline, mdiHomeOutline, mdiPlus } from '@mdi/js'

	import { Icon } from '$lib/material'
	import { page } from '$app/stores'
	import { eventPath } from '$lib/store'
	import { enhance } from '$app/forms'
	import { useForm } from '$lib/form/index.js'

	export let data

	const form = useForm()
</script>

<div class="flex gap-2 items-center">
	<div class="flex gap-1 overflow-x-auto border p-1 rounded-md">
		<a
			href="{$eventPath}/admin/pages/{data.pageIndex.id}"
			class="menu-item shrink-0"
			class:active={$page.params.pageId === data.pageIndex.id}
		>
			<Icon
				path={mdiHomeOutline}
				active={$page.params.pageId === data.pageIndex.id}
				class="opacity-60"
				size={20}
			/>
			<span>{data.pageIndex.title}</span>
		</a>

		{#each data.pages as { id, title }}
			<a
				href="{$eventPath}/admin/pages/{id}"
				class="menu-item shrink-0"
				class:active={$page.params.pageId === id}
			>
				<Icon
					path={mdiFileDocumentOutline}
					active={$page.params.pageId === id}
					class="opacity-60"
					size={20}
				/>

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
