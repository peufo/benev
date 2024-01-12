<script lang="ts">
	import { InputCheckboxsMenu } from '$lib/material'
	import { PeriodPickerButton } from '$lib/period'
	import { SUBSCRIBE_STATE } from '$lib/constant'

	export let teams: { id: string; name: string }[]
</script>

<PeriodPickerButton />

<!-- TODO: mise en place des customs fields sur les subscribes ?
	<FieldsFilter {fields} />
-->
