<script lang="ts">
	import { resolve } from '$app/paths'
	import type { User } from '@prisma/client'
	import Avatar from '$lib/me/Avatar.svelte'
	import { UserIcon } from '@lucide/svelte'

	interface Props {
		user?: User | undefined
	}

	let { user = undefined }: Props = $props()
</script>

<a href={resolve('/me')} class={['btn bg-base-100 btn-square ml-2 overflow-hidden']}>
	{#if user}
		<Avatar
			firstName={user.firstName}
			avatarId={user.avatarId}
			avatarPlaceholder={user.avatarPlaceholder}
			class="w-full h-full"
		/>
	{:else}
		<UserIcon />
	{/if}
</a>
