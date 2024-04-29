<script lang="ts">
	import { Card } from 'fuma'
</script>

<div class="max-w-md">
	<Card>
		<h2 slot="title">Actions</h2>

		<form method="post" class="flex flex-col gap-2">
			<button formaction="?/generate_all_avatars" class="btn"> Genérer tout les avatars </button>
		</form>
		<form method="post" class="flex flex-col gap-2">
			<button formaction="?/generate_emails_model" class="btn">
				Générer les models d'emails
			</button>
		</form>
	</Card>
</div>
