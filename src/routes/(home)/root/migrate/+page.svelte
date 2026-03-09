<script lang="ts">
	import { enhance } from '$app/forms'
	import { Card } from 'fuma'
	import { toast } from 'svelte-sonner'
</script>

<div class="max-w-md">
	<Card>
		<h2 slot="title">Actions</h2>

		<form
			method="post"
			class="flex flex-col gap-2"
			use:enhance={() => {
				return (res) => {
					toast.info(JSON.stringify(res.result))
				}
			}}
		>
			<button formaction="?/update_members_avatarId" class="btn">
				Update memmbers avatarId from user
			</button>
		</form>
	</Card>
</div>
