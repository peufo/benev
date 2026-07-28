<script lang="ts">
	import { eventPath } from '$lib/store'

	interface Props {
		id: string
		firstName: string
		lastName: string
	}

	let { id, firstName, lastName }: Props = $props()
</script>

<a href="{$eventPath}/admin/members/{id}" class="link link-hover">
	{firstName}
	{lastName}
</a>
