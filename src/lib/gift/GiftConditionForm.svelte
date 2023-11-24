<script lang="ts">
	import { enhance } from '$app/forms'
	import { InputText } from '$lib/material'
	import { eventPath } from '$lib/store'
	import { useForm } from '$lib/validation'
	import type { GiftCondition } from '@prisma/client'

	export let condition: GiftCondition | undefined = undefined

	const form = useForm()
</script>

<form
	use:enhance={form.submit}
	action="{$eventPath}/admin/config?{!!condition ? '/update_condition' : '/create_condition'}"
	method="post"
>
	<InputText />
</form>
