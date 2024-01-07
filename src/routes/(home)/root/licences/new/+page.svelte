<script lang="ts">
	import { enhance } from '$app/forms'
	import { useForm } from '$lib/validation'

	const form = useForm()
</script>

<form action="/root/licences/new" method="post" use:enhance={form.submit}>
	<div class="flex justify-end">
		<button class="btn"> Valider </button>
	</div>
</form>
