<script lang="ts">
	import { mdiFileDocumentOutline, mdiPlus } from '@mdi/js'
	import { enhance } from '$app/forms'
	import { page } from '$app/stores'

	import { Icon } from '$lib/material'
	import { eventPath } from '$lib/store'
	import { useForm } from '$lib/validation/index.js'
	import OnlyAdmin from '../OnlyAdmin.svelte'
	import { PAGE_TYPE } from '$lib/constant'

	export let data

	const form = useForm()
</script>

<OnlyAdmin>
	<div class="flex items-start">
		<div class="flex flex-col gap-1 max-w-[200px]">
			{#each data.pages as { id, title, type }}
				<a
					href="{$eventPath}/admin/pages/{id}"
					class="menu-item"
					class:active={$page.params.pageId === id}
				>
					<Icon path={PAGE_TYPE[type].icon} class="opacity-60 w-6" size={20} />
					<span class="overflow-hidden text-ellipsis">{title}</span>
				</a>
			{/each}

			<form
				action="{$eventPath}/admin/pages?/create_page"
				method="post"
				class="contents"
				use:enhance={form.submit}
			>
				<button class="menu-item">
					<Icon path={mdiPlus} class="opacity-70" />
					<span>Nouvelle page</span>
				</button>
			</form>
		</div>

		<div class="divider divider-horizontal" />

		<div class="grow">
			<slot />
		</div>
	</div>
</OnlyAdmin>
