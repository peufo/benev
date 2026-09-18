<script lang="ts">
	// import { toast } from 'svelte-sonner'
	import { Surface } from '$lib/ui'
	// import { enhance } from '$app/forms'
</script>

<div class="max-w-md">
	<Surface title="Actions">
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
	</Surface>
</div>
