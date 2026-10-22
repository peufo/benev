<script lang="ts">
	import {
		ArrowRightLeftIcon,
		AtSignIcon,
		CakeIcon,
		CircleXIcon,
		EyeOffIcon,
		MapPinIcon,
		PhoneIcon,
		PlusIcon,
		TriangleAlertIcon,
		UserIcon,
		type IconProps,
	} from '@lucide/svelte'
	import type { Component } from 'svelte'
	import { InputSelect, tip } from 'fuma'
	import type { Field } from '@prisma/client'
	import { MEMBER_FIELD_TYPE } from '#lib/constant/index.js'
	import { fieldCall } from '#lib/drawerCall.svelte.js'
	import { plural } from '#lib/utils.js'
	import {
		CONTACT_TARGETS,
		suggestField,
		type ColumnReport,
		type FieldSuggestion,
		type ColumnTarget,
		type ContactKey,
		type ImportField,
	} from '#lib/member/import/index.js'

	interface Props {
		header: string
		column: number
		rows: string[][]
		/** Le champ à créer quand la source le connaît; sinon, deviné d'après les valeurs. */
		hint?: FieldSuggestion
		target: ColumnTarget
		report: ColumnReport
		fields: ImportField[]
		onchange: (target: ColumnTarget) => void
		oncreated: (field: Field) => void
		onmapvalues: () => void
	}

	let {
		header,
		column,
		rows,
		hint,
		target,
		report,
		fields,
		onchange,
		oncreated,
		onmapvalues,
	}: Props = $props()

	type Item = {
		value: Exclude<ColumnTarget, null>
		label: string
		/** Ce que la cible attend: « Coordonnée » ou le type du champ. */
		type: string
		icon?: Component<IconProps>
	}

	const CONTACT_ICONS: Record<ContactKey, Component<IconProps>> = {
		fullName: UserIcon,
		firstName: UserIcon,
		lastName: UserIcon,
		email: AtSignIcon,
		phone: PhoneIcon,
		birthday: CakeIcon,
		street: MapPinIcon,
		zipCode: MapPinIcon,
		city: MapPinIcon,
	}

	const items: Item[] = $derived([
		{ value: 'ignore', label: 'Ignorer la colonne', type: '', icon: EyeOffIcon },
		...(Object.keys(CONTACT_TARGETS) as ContactKey[]).map((key) => ({
			value: `contact:${key}` as const,
			label: CONTACT_TARGETS[key],
			type: 'Coordonnée',
			icon: CONTACT_ICONS[key],
		})),
		...fields.map((field) => ({
			value: `field:${field.id}` as const,
			label: field.name,
			type: MEMBER_FIELD_TYPE[field.type].label,
			icon: MEMBER_FIELD_TYPE[field.type].icon,
		})),
	])

	const selectedField = $derived(
		target?.startsWith('field:')
			? fields.find((field) => `field:${field.id}` === target)
			: undefined
	)
	const canMapValues = $derived(
		selectedField?.type === 'select' || selectedField?.type === 'multiselect'
	)
</script>

{#snippet itemSnippet(item: Item, compact: boolean)}
	<span class="flex w-full items-center gap-2">
		{#if item.icon}
			<item.icon size={compact ? 14 : 16} class="shrink-0 opacity-70" />
		{/if}
		<span class="grow truncate">{item.label}</span>
		<!-- Fermé, le sélecteur est étroit: l'icône y dit le type, le libellé garde la place. -->
		{#if item.type && !compact}
			<span class="shrink-0 text-xs text-base-content/60">{item.type}</span>
		{/if}
	</span>
{/snippet}

<div class="flex flex-col gap-1">
	<!-- La cible bouge sans geste dans le sélecteur quand un champ est créé: liée, pas passée. -->
	<InputSelect
		label={header}
		{items}
		bind:value={
			() => items.find((item) => item.value === target), (item) => onchange(item?.value ?? null)
		}
		placeholder="Choisir un champ"
		class="input-sm"
	>
		{#snippet selected(item)}
			{@render itemSnippet(item, true)}
		{/snippet}
		{#snippet proposal(item)}
			{@render itemSnippet(item, false)}
		{/snippet}
		{#snippet append({ hide })}
			<a
				{...fieldCall.link(
					{ oncreated },
					{ value: JSON.stringify(hint ?? suggestField(header, rows, column)), onclick: hide }
				)}
				class="btn btn-square btn-soft btn-sm"
				aria-label="Créer un champ"
				use:tip={{ content: 'Créer un champ' }}
			>
				<PlusIcon size={20} />
			</a>
		{/snippet}
	</InputSelect>

	<div class="flex min-h-6 items-center gap-1 text-xs">
		{#if report.status === 'unmapped'}
			<TriangleAlertIcon size={14} class="text-warning shrink-0" />
			Aucun champ trouvé
		{:else if report.status === 'duplicate'}
			<CircleXIcon size={14} class="text-error shrink-0" />
			Champ déjà utilisé
		{:else if report.status === 'invalid'}
			<CircleXIcon size={14} class="text-error shrink-0" />
			{plural(report.invalid.size, 'valeur invalide', 'valeurs invalides')}
		{/if}

		{#if canMapValues}
			<button
				type="button"
				class="btn btn-ghost btn-xs ml-auto"
				onclick={onmapvalues}
				use:tip={{ content: 'Faire correspondre les valeurs aux options du champ' }}
			>
				<ArrowRightLeftIcon size={14} />
				Correspondance
			</button>
		{/if}
	</div>
</div>
