<script lang="ts">
	import { Card } from '$lib/material'
</script>

<div class="max-w-md">
	<Card>
		<h2 slot="title">Actions</h2>

		<form method="post" class="flex flex-col gap-2">
			<button formaction="?/generate_all_avatars" class="btn"> Genérer tout les avatars </button>
			<button formaction="?/editorjs_to_tiptap" class="btn"> Migrer les pages vers tiptap </button>
		</form>
	</Card>
</div>
