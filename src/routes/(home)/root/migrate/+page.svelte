<script lang="ts">
	import { Card } from '$lib/material'
</script>

<div class="max-w-md">
	<Card>
		<h2 slot="title">Actions</h2>

		<form method="post" class="flex flex-col gap-2">
			<button formaction="?/generate_all_avatars" class="btn"> Genérer tout les avatars </button>
		</form>
		<form method="post" class="flex flex-col gap-2">
			<button formaction="?/generate_all_member_profil" class="btn"> Générer les valeur de profil par défaut</button>
		</form>
	</Card>
</div>
