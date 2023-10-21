<script lang="ts">
	import { Card } from '$lib/material'

	export let data
</script>

<div class="flex flex-col gap-4">
	<h1>HELLO ROOT</h1>

	<a href="/root/mails" class="link link-hover"> Model de mail </a>

	<div>
		<p>
			timezone client: <b>{new Date().getTimezoneOffset()}</b>
		</p>
		<p>
			timezone server: <b>{data.timezoneOffsetServer}</b>
		</p>
	</div>
</div>

<div class="max-w-md">
	<Card>
		<h2 slot="title">Actions</h2>

		<form method="post" class="flex flex-col gap-2">
			<button formaction="?/generate_all_avatars" class="btn"> Genérer tout les avatars </button>
		</form>
	</Card>
</div>
