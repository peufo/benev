<script lang="ts">
	import { Avatar } from '$lib/me'
	import { MemberAbsences, MemberRole } from '$lib/member'
	import type { PageData } from './$types'

	export let member: PageData['members'][number]
</script>

<td>
	<div class="flex gap-2 items-center">
		<Avatar user={member.user} class="h-8 w-8 rounded border" />
		<span class="whitespace-nowrap">
			{member.user.firstName}
			{member.user.lastName}
		</span>
		<MemberRole roles={member.roles} mode="icon" />
		<MemberAbsences subscribes={member.subscribes} />
	</div>
</td>
