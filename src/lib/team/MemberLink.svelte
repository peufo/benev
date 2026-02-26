<script lang="ts">
	import { eventPath } from '$lib/store'

	export let id: string
	export let firstName: string
	export let lastName: string
</script>

<a href="{$eventPath}/admin/members/{id}" class="link link-hover">
	{firstName}
	{lastName}
</a>
