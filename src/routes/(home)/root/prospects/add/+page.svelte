<script lang="ts">
	import { enhance } from '$app/forms'
	import { InputBoolean, InputTextarea } from 'fuma'
	import { useForm } from '$lib/validation'

	const form = useForm()
</script>

<form action="?/add_prospects" method="post" use:enhance={form.submit}>
	<InputTextarea
		key="prospects"
		label="Nouveau prospect"
		textarea={{ placeholder: 'name -> email -> site' }}
	/>

	<InputBoolean key="sendEmail" label="send emails" />

	<div class="flex justify-end">
		<button class="btn"> Importer </button>
	</div>
</form>
