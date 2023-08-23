<script lang="ts">
	import { enhance } from '$app/forms'
	import WorkInProgress from '$lib/WorkInProgress.svelte'
	import { memberFieldType, useForm } from '$lib/form'
	import { InputSelect } from '$lib/material'

	const form = useForm()
</script>

<WorkInProgress />

<form method="post" use:enhance={form.submit}>
	<InputSelect key="type" value="string" options={memberFieldType} />
</form>
