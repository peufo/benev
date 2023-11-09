<script lang="ts">
	import { User } from '@prisma/client'
	import { Icon } from '$lib/material'
	import { eventPath } from '$lib/store'
	import { mdiAccountOutline } from '@mdi/js'
	import Avatar from '$lib/me/Avatar.svelte'

	export let user: User | undefined = undefined
</script>

<a
	href={$eventPath ? `${$eventPath}/me` : `/me`}
	class="
		btn bg-base-100 btn-square grid place-content-center
		hover:shadow-lg transition-shadow ml-2
	"
>
	{#if user}
		<Avatar {user} class="rounded-lg" />
	{:else}
		<Icon path={mdiAccountOutline} />
	{/if}
</a>
