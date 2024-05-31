<script lang="ts">
	import { mdiClose } from '@mdi/js'
	import { Icon, InputSelect, urlParam } from 'fuma'
	import type { Field } from '@prisma/client'

	import { goto } from '$app/navigation'

	export let fields: Field[]

	let fieldId = $urlParam.get('fieldId') || ''
	let fieldValue = $urlParam.get('fieldValue') || ''

	function resetFieldValue() {
		fieldValue = ''
		goto($urlParam.without('fieldId', 'fieldValue'), { replaceState: true, noScroll: true })
	}

	function handleSelectFieldValue() {
		if (!fieldId || !fieldValue) {
			goto($urlParam.without('fieldId', 'fieldValue'), { replaceState: true, noScroll: true })
		}
		goto($urlParam.with({ fieldId, fieldValue }), { replaceState: true, noScroll: true })
	}
</script>

<div class="flex">
	<InputSelect
		bind:value={fieldId}
		options={fields
			.filter((f) => f.type === 'select' || f.type === 'multiselect')
			.map((f) => ({ value: f.id, label: f.label || f.name }))}
		class="join-item btn-sm {fieldId ? 'rounded-r-none' : ''}"
		on:select={resetFieldValue}
		placeholder="Plus"
	/>

	{#if fieldId}
		{@const field = fields.find((f) => f.id === fieldId)}
		{#if field}
			<InputSelect
				bind:value={fieldValue}
				options={field.options || []}
				class="btn-sm rounded-l-none {fieldValue ? 'btn-primary rounded-r-none' : ''}"
				on:select={handleSelectFieldValue}
				placeholder="..."
			/>
			{#if fieldValue}
				<button class="btn btn-square btn-sm rounded-l-none" on:click={resetFieldValue}>
					<Icon path={mdiClose} />
				</button>
			{/if}
		{/if}
	{/if}
</div>
