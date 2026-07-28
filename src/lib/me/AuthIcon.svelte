<script lang="ts">
	import type { User } from '@prisma/client'
	import { Icon } from '$lib/fuma'
	import { mdiAccountOutline } from '@mdi/js'
	import Avatar from '$lib/me/Avatar.svelte'

	interface Props {
		user?: User | undefined
	}

	let { user = undefined }: Props = $props()
</script>

<a
	href="/me"
	class="
		btn bg-base-100 btn-square grid place-content-center
		hover:shadow-lg transition-shadow ml-2
	"
>
	{#if user}
		<Avatar
			firstName={user.firstName}
			avatarId={user.avatarId}
			avatarPlaceholder={user.avatarPlaceholder}
			class="rounded-lg w-full h-full"
		/>
	{:else}
		<Icon path={mdiAccountOutline} />
	{/if}
</a>
