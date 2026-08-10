<script lang="ts">
	import type { Field } from '@prisma/client'
	import { InputCheckboxes, InputNumber, InputRadio, InputString } from 'fuma'
	import type { MemberCondition } from '$lib/models'

	type ProfileCondition = Extract<MemberCondition, { type: 'profile' }>

	interface Props {
		field: Field
		condition: ProfileCondition
	}

	// `condition` est un proxy `$state` du parent: écrire dans `args.expectedValue` suffit.
	// Les liaisons sont fonctionnelles, faute de pouvoir rétrécir l'union du modèle au type du
	// champ — ce que `bind:` ne sait pas faire.
	let { field, condition }: Props = $props()

	let asString = $derived(
		typeof condition.args.expectedValue === 'string' ? condition.args.expectedValue : ''
	)
	let asNumber = $derived(
		typeof condition.args.expectedValue === 'number' ? condition.args.expectedValue : undefined
	)
	let asArray = $derived(
		Array.isArray(condition.args.expectedValue) ? condition.args.expectedValue : []
	)
</script>

{#if field.type === 'string' || field.type === 'textarea'}
	<InputString
		label="Valeur"
		bind:value={() => asString, (value) => (condition.args.expectedValue = value ?? '')}
	/>
{:else if field.type === 'number'}
	<!-- Vider le champ donne `undefined`: on garde la dernière valeur saisie, sans quoi la
	     réécriture dans le champ empêcherait de le retaper. -->
	<InputNumber
		label="Valeur"
		bind:value={
			() => asNumber,
			(value) => {
				if (value === undefined) return
				condition.args.expectedValue = value
			}
		}
	/>
{:else if field.type === 'boolean'}
	<!-- La valeur reste la chaîne `'true'`/`'false'`: `isMemberAllowed` stringifie celle du
	     membre pour la comparer. -->
	<InputRadio
		label="Valeur"
		options={{ true: 'Oui', false: 'Non' }}
		bind:value={() => asString, (value) => (condition.args.expectedValue = value ?? '')}
	/>
{:else}
	<InputCheckboxes
		label="Valeur"
		options={field.options ?? []}
		bind:value={() => asArray, (value) => (condition.args.expectedValue = value)}
	/>
{/if}
