<script lang="ts">
	import { modelTagCreate } from '$lib/models'
	import { eventPath } from '$lib/store'
	import type { Tag } from '@prisma/client'
	import { Form, InputText } from 'fuma'
	import type { ComponentType } from 'svelte'

	export let tag: Partial<Tag> = {}
	const TagForm: ComponentType<Form<typeof modelTagCreate, Tag>> = Form
	const colors = [
		'#6CBEED',
		'#D7F171',
		'#7FC29B',
		'#63D2FF',
		'#6741d9',
		'#9c36b5',
		'#c2255c',
		'#f08c02',
		'#e8580c',
		'#846358',
	]
	if (!tag.color) tag.color = colors[Math.round(Math.random() * (colors.length - 1))]
</script>

<TagForm
	action="{$eventPath}?/tag"
	model={modelTagCreate}
	data={tag}
	options={{
		successMessage: tag.id ? 'Étiquette modifiée' : 'Étiquette crée',
		successUpdate: false,
	}}
	on:created
	on:updated
	on:deleted
	on:success
>
	<InputText
		key="name"
		label="Nom"
		value={tag.name}
		input={{ autocomplete: 'off', autofocus: true }}
	/>
	<label class="form-control w-full max-w-xs">
		<div class="label">
			<span class="label-text">Couleur</span>
		</div>
		<input
			name="color"
			type="color"
			class="input input-bordered w-full"
			value={tag.color}
			list="colors"
		/>
		<datalist id="colors">
			{#each colors as color}
				<option value={color} />
			{/each}
		</datalist>
	</label>
</TagForm>
