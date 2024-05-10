<script lang="ts">
	import { InputNumber } from 'fuma'
	import type { LicenceType } from '@prisma/client'

	export let index: number
	export let type: LicenceType
	export let ownerId = ''

	$: prefix = `licences.${index}.`
</script>

<div class="border p-4 rounded grow">
	<h3 class="title text-base">Licence "{type}"</h3>
	<input type="hidden" name="{prefix}type" value={type} />
	<input type="hidden" name="{prefix}ownerId" value={ownerId} />

	<InputNumber key="{prefix}quantity" label="Quantity" value={0} />
</div>
