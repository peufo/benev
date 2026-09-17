<script lang="ts" generics="S extends string">
	import type { RemoteForm } from '@sveltejs/kit'
	import type { ClassValue } from 'svelte/elements'
	import { ChevronDownIcon } from '@lucide/svelte'
	import { Popover, tip } from 'fuma'
	import { toast } from 'svelte-sonner'
	import type { StateOption } from '$lib/constant'
	import { enhanceForm } from '$lib/enhanceForm'

	interface Props {
		states: Record<S, StateOption>
		state: S
		/** Les changements possibles depuis l'état courant, dans l'ordre du menu. Vide: lecture seule. */
		transitions: { state: S; label: string }[]
		/** La fonction distante qui change l'état: elle reçoit `id` et `state`. */
		form: RemoteForm<{ id: string; state: S }, void>
		/** L'enregistrement dont l'état change, et la clé de l'instance du formulaire. */
		id: string
		class?: ClassValue
	}

	// `state` est le nom du rune: la prop se lit sous un autre nom.
	let { states, state: value, transitions, form, id, class: klass }: Props = $props()

	const uid = $props.id()
	// Une instance par enregistrement: `for()` injecte `id` dans les données soumises.
	const remoteForm = $derived(form.for(id))
	const StateIcon = $derived(states[value].icon)
	// L'état visé se lit sur le bouton pressé, que le succès ne connaît plus.
	let chosen = $state<S>()
</script>

{#snippet current()}
	<StateIcon size={20} class={states[value].class} />
	<span>{states[value].label}</span>
{/snippet}

{#if !transitions.length}
	<span
		class={['badge badge-lg badge-ghost gap-1.5 self-center', klass]}
		use:tip={{ content: states[value].description }}
	>
		{@render current()}
	</span>
{:else}
	<Popover listenFocus={false} class="p-1 my-1">
		{#snippet trigger({ trigger })}
			<button
				type="button"
				class={['btn btn-sm whitespace-nowrap', klass]}
				{...trigger}
				use:tip={{ content: states[value].description }}
			>
				{@render current()}
				<ChevronDownIcon size={16} class="opacity-60" />
			</button>
		{/snippet}

		{#snippet children({ hide })}
			<form
				{...remoteForm.enhance(
					enhanceForm({
						onsuccess: () => {
							if (chosen) toast.success(states[chosen].label)
							hide()
						},
					})
				)}
				class="flex flex-col w-max max-w-72"
			>
				{#each transitions as { state: target, label } (target)}
					{@const TargetIcon = states[target].icon}
					<!-- La description explique le bouton sans entrer dans son nom: elle est
					     rattachée par `aria-describedby`, et soustraite au texte du bouton. -->
					<button
						class="menu-item w-full items-start"
						name="state"
						value={target}
						aria-describedby="{uid}-{target}"
						onclick={() => (chosen = target)}
					>
						<TargetIcon size={20} class={['shrink-0 mt-0.5', states[target].class]} />
						<span class="flex flex-col items-start text-left whitespace-normal">
							<span class="font-medium">{label}</span>
							<span id="{uid}-{target}" class="text-xs opacity-70" aria-hidden="true">
								{states[target].description}
							</span>
						</span>
					</button>
				{/each}
			</form>
		{/snippet}
	</Popover>
{/if}
