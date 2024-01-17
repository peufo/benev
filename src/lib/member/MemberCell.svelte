<script lang="ts">
	import { page } from '$app/stores'
	import { Avatar } from '$lib/me'
	import { MemberAbsences, MemberRole } from '$lib/member'
	import type { MemberWithComputedValues } from '$lib/server'
	import { eventPath } from '$lib/store'

	import type { Subscribe } from '@prisma/client'

	export let member: MemberWithComputedValues & { subscribes?: Subscribe[] }
</script>

<a
	class="menu-item pl-0 py-0 flex gap-2 items-center group"
	href="{$eventPath}/admin/members/{member.id}{$page.url.search}"
>
	<Avatar
		user={member.user}
		class="h-8 w-8 rounded border group-hover:scale-125 transition-transform"
	/>
	<span class="whitespace-nowrap">
		{member.user.firstName}
		{member.user.lastName}
	</span>

	<MemberRole roles={member.roles} mode="icon" />

	{#if member.subscribes}
		<MemberAbsences subscribes={member.subscribes} />
	{/if}
</a>
