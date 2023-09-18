<script lang="ts">
	import { mdiClose, mdiFilterOutline } from '@mdi/js'
	import { Field } from '@prisma/client'

	import { Icon, InputSelect } from '$lib/material'
	import { goto } from '$app/navigation'
	import { urlParam } from '$lib/store'

	export let fields: Field[]

	let fieldId = ''
	let fieldValue = ''

	function resetFieldValue() {
		fieldValue = ''
		goto($urlParam.without('fieldId', 'fieldValue'), { replaceState: true })
	}

	function handleSelectFieldValue() {
		if (!fieldId || !fieldValue) {
			goto($urlParam.without('fieldId', 'fieldValue'), { replaceState: true })
		}
		goto($urlParam.with({ fieldId, fieldValue }), { replaceState: true })
	}
</script>

<div class="flex">
	<InputSelect
		bind:value={fieldId}
		options={fields
			.filter((f) => f.type === 'select' || f.type === 'multiselect')
			.map((f) => ({ value: f.id, label: f.label || f.name }))}
		class="join-item"
		btnClass="btn-sm {fieldId ? 'rounded-r-none' : ''}"
		on:select={resetFieldValue}
	>
		<div class="contents" slot="placeholder">
			<Icon path={mdiFilterOutline} class="opacity-70 fill-base-content scale-90" />
			Autre
		</div>
	</InputSelect>

	{#if fieldId}
		{@const field = fields.find((f) => f.id === fieldId)}
		{#if field}
			<InputSelect
				bind:value={fieldValue}
				options={field.options || []}
				btnClass="btn-sm rounded-l-none {fieldValue ? 'btn-primary rounded-r-none' : ''}"
				on:select={handleSelectFieldValue}
			>
				<div class="contents" slot="placeholder">
					<Icon path={mdiFilterOutline} class="opacity-70 fill-base-content scale-90" />
					...
				</div>
			</InputSelect>
			{#if fieldValue}
				<button class="btn btn-square btn-sm rounded-l-none" on:click={resetFieldValue}>
					<Icon path={mdiClose} />
				</button>
			{/if}
		{/if}
	{/if}
</div>
