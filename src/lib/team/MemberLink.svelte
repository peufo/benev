<script lang="ts">
	import { eventPath } from '$lib/eventPath'

	interface Props {
		id: string
		firstName: string
		lastName: string
	}

	let { id, firstName, lastName }: Props = $props()
</script>

<a href={eventPath('/admin/members/[memberId]', { memberId: id })} class="link link-hover">
	{firstName}
	{lastName}
</a>
