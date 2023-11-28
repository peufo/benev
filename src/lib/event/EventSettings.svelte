<script lang="ts">
	import { enhance } from '$app/forms'
	import { eventPath } from '$lib/store'
	import { useForm } from '$lib/validation'

	const form = useForm()
</script>

<form action="{$eventPath}/admin/config?/set_settings" method="post" use:enhance={form.submit}>
	TODO
</form>
