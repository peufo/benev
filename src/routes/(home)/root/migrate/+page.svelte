<script lang="ts">
	import { Card } from 'fuma'
</script>

<div class="max-w-md">
	<Card>
		<h2 slot="title">Actions</h2>

		<form method="post" class="flex flex-col gap-2">
			<button formaction="?/copy_user_to_members" class="btn"> COPY PROFILES TO MEMBERS </button>
		</form>
		<form method="post" class="flex flex-col gap-2">
			<button formaction="?/rm_headless_users" class="btn btn-error"> REMOVE HEADLESS USER </button>
		</form>
	</Card>
</div>
