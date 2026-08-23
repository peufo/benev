<script lang="ts">
	import { page } from '$app/state'
	import { Avatar } from '$lib/me'
	import { MemberAbsences, MemberRole } from '$lib/member'
	import type { MemberWithComputedValues } from '$lib/server'
	import { eventPath, withSearch } from '$lib/eventPath'

	import type { Subscribe } from '@prisma/client'

	interface Props {
		member: MemberWithComputedValues & { subscribes?: Subscribe[] }
	}

	let { member }: Props = $props()
</script>

<a
	class="menu-item pl-0 py-0 flex gap-2 items-center group"
	href={withSearch(
		eventPath('/admin/members/[memberId]', { memberId: member.id }),
		page.url.search
	)}
>
	<Avatar
		firstName={member.firstName}
		avatarId={member.avatarId}
		avatarPlaceholder={member.avatarPlaceholder}
		class="h-8 w-8 rounded border group-hover:scale-125 transition-transform"
	/>
	<span class="whitespace-nowrap">
		{member.firstName}
		{member.lastName}
	</span>

	<MemberRole roles={member.roles} mode="icon" />

	{#if member.subscribes}
		<MemberAbsences subscribes={member.subscribes} />
	{/if}
</a>
