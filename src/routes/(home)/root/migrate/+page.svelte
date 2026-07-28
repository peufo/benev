<script lang="ts">
	// import { toast } from 'svelte-sonner'
	import { Card } from '$lib/fuma'
	// import { enhance } from '$app/forms'
</script>

<div class="max-w-md">
	<Card>
		{#snippet title()}
				<h2 >Actions</h2>
			{/snippet}

		<!-- <form
			method="post"
			class="flex flex-col gap-2"
			use:enhance={() => {
				return (res) => {
					toast.info(JSON.stringify(res.result))
				}
			}}
		>
			<button formaction="?/event_address_to_location" class="btn">
				Migrate events address to location
			</button>
		</form> -->
	</Card>
</div>
