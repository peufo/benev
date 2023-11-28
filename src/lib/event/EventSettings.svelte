<script lang="ts">
	import { enhance } from '$app/forms'
	import { InputBoolean } from '$lib/material'
	import { eventPath } from '$lib/store'
	import { useForm } from '$lib/validation'

	const form = useForm()
</script>

<form action="{$eventPath}/admin/config?/set_settings" method="post" use:enhance={form.submit}>
	<InputBoolean />
</form>
