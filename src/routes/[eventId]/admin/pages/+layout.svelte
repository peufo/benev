<script lang="ts">
	import { page } from '$app/state'

	import { Card } from '$lib/ui'
	import { tip } from 'fuma'
	import { eventPath } from '$lib/store'
	import OnlyAdmin from '../OnlyAdmin.svelte'
	import { PAGE_TYPE } from '$lib/constant'
	import { IdCardLanyardIcon, PlusIcon } from '@lucide/svelte'
	import { enhanceForm } from '$lib/enhanceForm'
	import { createBadge, createPage } from './pages.remote'

	let { data, children } = $props()
</script>

<Card class="mx-auto" style="min-width: min(100%, 1280px)">
	<OnlyAdmin>
		<div class="flex items-start">
			<div class="flex flex-col gap-1 max-w-[200px]">
				<div class="flex gap-2 mb-2 items-center">
					<h2 class="title-md">Pages du site</h2>
					<form
						{...createPage.enhance(enhanceForm({ success: 'Nouvelle page créer !' }))}
						class="contents"
					>
						<button class="btn btn-square btn-sm ml-auto" use:tip={{ content: 'Nouvelle page' }}>
							<PlusIcon class="opacity-70" />
						</button>
					</form>
				</div>
				{#each data.pages as { id, title, type } (id)}
					{@const PageIcon = PAGE_TYPE[type].icon}
					<a
						href="{$eventPath}/admin/pages/{id}"
						class="menu-item"
						class:active={page.params.pageId === id}
					>
						<PageIcon class="opacity-60 w-6 shrink-0" size={20} />
						<span class="overflow-hidden text-ellipsis text-sm">{title}</span>
					</a>
				{/each}

				<h2 class="title-md my-2">Models d'email</h2>
				{#each data.emails as { id, title, type } (id)}
					{@const EmailIcon = PAGE_TYPE[type].icon}
					<a
						href="{$eventPath}/admin/pages/{id}"
						class="menu-item"
						class:active={page.params.pageId === id}
					>
						<EmailIcon class="opacity-60 w-6 shrink-0" size={20} />
						<span class="overflow-hidden text-ellipsis text-sm">{title}</span>
					</a>
				{/each}
				<div class="flex gap-2 my-2 items-center">
					<h2 class="title-md my-2">Models de badge</h2>

					<form
						{...createBadge.enhance(enhanceForm({ success: 'Nouveau badge créer !' }))}
						class="contents"
					>
						<button class="btn btn-square btn-sm ml-auto" use:tip={{ content: 'Nouveau badge' }}>
							<PlusIcon class="opacity-70" />
						</button>
					</form>
				</div>
				{#each data.badges as badge (badge.id)}
					<a
						href="{$eventPath}/admin/pages/badges/{badge.id}"
						class="menu-item"
						class:active={page.params.badgeId === badge.id}
					>
						<IdCardLanyardIcon size="20" opacity={0.6} />
						<span class="overflow-hidden text-ellipsis text-sm">
							{badge.name}
						</span>
					</a>
				{/each}
			</div>

			<div class="divider divider-horizontal"></div>

			<div class="grow">
				{@render children?.()}
			</div>
		</div>
	</OnlyAdmin>
</Card>
