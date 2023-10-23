<script lang="ts">
	import { page } from '$app/stores'
	import { User } from '@prisma/client'
	import { Icon, DropDown } from '$lib/material'
	import { eventPath } from '$lib/store'
	import {
		mdiAccountOutline,
		mdiCardAccountDetailsOutline,
		mdiListStatus,
		mdiLogout,
	} from '@mdi/js'
	import Avatar from '$lib/me/Avatar.svelte'

	const tabs = [
		{ path: 'subscribes', label: 'Mes inscriptions', icon: mdiListStatus },
		{ path: 'profile', label: 'Mon profil', icon: mdiCardAccountDetailsOutline },
	]

	export let user: User | undefined = undefined
	export let pathPrefix = ''
</script>

{#if user}
	<DropDown class="min-w-[200px]" hideOnBlur>
		<button
			slot="activator"
			class="
			btn bg-base-100 btn-square block
			hover:shadow-lg transition-shadow
		"
		>
			<Avatar {user} class="rounded-lg" />
		</button>

		<div class="flex flex-col gap-1">
			{#each tabs as { path, label, icon }}
				{@const href = `${pathPrefix}/me/${path}`}
				{@const active = $page.url.pathname === href}
				<a {href} class="menu-item" class:active>
					<Icon path={icon} size={20} class="opacity-70" {active} />
					{label}
				</a>
			{/each}

			<form method="POST" action="/me?/logout" class="contents">
				<button class="menu-item w-full border">
					<Icon path={mdiLogout} size={20} class="opacity-70" />
					Déconnexion
				</button>
			</form>
		</div>
	</DropDown>
{:else}
	<a class="btn-ghost rounded-btn btn btn-square" href={$eventPath ? `${$eventPath}/me` : `/me`}>
		<Icon path={mdiAccountOutline} />
	</a>
{/if}
