<script lang="ts">
	import type { User } from 'lucia'

	export let user: User
</script>

<div class="flex items-center">
	<span>{user.firstName} {user.lastName}</span>
	<div class="grow" />
	<span style="font-size: 0.6rem;">{user.email}</span>
</div>
