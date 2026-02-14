<script lang="ts">
	import { mdiPlus } from '@mdi/js'
	import { enhance } from '$app/forms'
	import { page } from '$app/stores'

	import { Card, Icon, tip } from 'fuma'
	import { eventPath } from '$lib/store'
	import { useForm } from 'fuma/validation'
	import OnlyAdmin from '../OnlyAdmin.svelte'
	import { PAGE_TYPE } from '$lib/constant'
	import { IdCardLanyardIcon } from 'lucide-svelte'
	import { toast } from 'svelte-sonner'

	export let data

	const form = useForm({
		onSuccess(url) {
			if (url.searchParams.has('/page_create')) toast.success('Nouvelle page créer !')
			if (url.searchParams.has('/badge_create')) toast.success('Nouveau badge créer !')
		},
	})
</script>

<Card class="mx-auto" style="min-width: min(100%, 1280px)">
	<OnlyAdmin>
		<div class="flex items-start">
			<div class="flex flex-col gap-1 max-w-[200px]">
				<div class="flex gap-2 mb-2 items-center">
					<h2 class="title-md">Pages du site</h2>
					<form
						action="{$eventPath}/admin/pages?/page_create"
						method="post"
						class="contents"
						use:enhance={form.submit}
					>
						<button class="btn btn-square btn-sm ml-auto" use:tip={{ content: 'Nouvelle page' }}>
							<Icon path={mdiPlus} class="opacity-70" />
						</button>
					</form>
				</div>
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

				<h2 class="title-md my-2">Models d'email</h2>
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
				<div class="flex gap-2 my-2 items-center">
					<h2 class="title-md my-2">Models de badge</h2>

					<form
						action="{$eventPath}/admin/pages?/badge_create"
						method="post"
						class="contents"
						use:enhance={form.submit}
					>
						<button class="btn btn-square btn-sm ml-auto" use:tip={{ content: 'Nouveau badge' }}>
							<Icon path={mdiPlus} class="opacity-70" />
						</button>
					</form>
				</div>
				{#each data.badges as badge}
					<a
						href="{$eventPath}/admin/pages/badges/{badge.id}"
						class="menu-item"
						class:active={$page.params.badgeId === badge.id}
					>
						<IdCardLanyardIcon size="20" opacity={0.6} />
						<span class="overflow-hidden text-ellipsis text-sm">
							{badge.name}
						</span>
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
