<script lang="ts">
	import { mdiPlus } from '@mdi/js'
	import { enhance } from '$app/forms'
	import { page } from '$app/stores'

	import { Card, Icon } from 'fuma'
	import { eventPath } from '$lib/store'
	import { useForm } from 'fuma/validation'
	import OnlyAdmin from '../OnlyAdmin.svelte'
	import { PAGE_TYPE } from '$lib/constant'

	export let data

	const form = useForm()
</script>

<Card>
	<OnlyAdmin>
		<div class="flex items-start">
			<div class="flex flex-col gap-1 max-w-[200px]">
				<h2 class="title-md pb-2">Pages du site</h2>
				{#each data.pages as { id, title, type }}
					<a
						href="{$eventPath}/admin/pages/{id}"
						class="menu-item"
						class:active={$page.params.pageId === id}
					>
						<Icon path={PAGE_TYPE[type].icon} class="opacity-60 w-6 shrink-0" size={20} />
						<span class="overflow-hidden text-ellipsis text-sm">{title}</span>
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
						<span class="text-sm">Nouvelle page</span>
					</button>
				</form>

				<h2 class="title-md pb-2 pt-10">Models d'email</h2>
				{#each data.emails as { id, title, type }}
					<a
						href="{$eventPath}/admin/pages/{id}"
						class="menu-item"
						class:active={$page.params.pageId === id}
					>
						<Icon path={PAGE_TYPE[type].icon} class="opacity-60 w-6 shrink-0" size={20} />
						<span class="overflow-hidden text-ellipsis text-sm">{title}</span>
					</a>
				{/each}
			</div>

			<div class="divider divider-horizontal" />

			<div class="grow">
				<slot />
			</div>
		</div>
	</OnlyAdmin>
</Card>
