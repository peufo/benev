<script lang="ts">
	import { InputBoolean, InputMultiSelect, InputString, tip } from 'fuma'
	import z from 'zod'
	import { slide } from 'svelte/transition'
	import { toast } from 'svelte-sonner'
	import type { Event, EventState, Member, Team } from '@prisma/client'
	import { page } from '$app/state'
	import { enhanceForm } from './enhanceForm'
	import { type DrawerFrom, teamCall } from './drawerCall.svelte'
	import { createInvite, findUserByEmail } from './member/member.remote'
	import { searchTeams } from './team/team.remote'
	import { PlusIcon } from '@lucide/svelte'

	interface Props {
		event: Event
		/** Qui a ouvert le tiroir. */
		openedFrom?: DrawerFrom
		onCreate?: (member: Member) => void
	}

	let { event, openedFrom, onCreate = () => {} }: Props = $props()

	/**
	 * Ouvert depuis un formulaire de secteur, le membre invité y rejoint les responsables:
	 * rouvrir un secteur d'ici ferait boucler la pile.
	 *
	 * Figé: la provenance ne change pas pendant la vie du tiroir, et l'appel s'éteint avec la clé
	 * de l'URL, avant le démontage — le relire ferait revenir le champ le temps qu'il glisse.
	 */
	const hideLeaderOf = $derived(openedFrom === 'team')
	let email = $state('')
	let isEmailValid = $state(false)
	let isLoadingUserExists = $state(false)
	let user = $state({ firstName: '', lastName: '' })
	// Lié, et non passé en simple prop: `reset()` repilote la sélection après coup, ce qu'un
	// `$bindable` cesse de suivre dès que le composant y a écrit.
	let leaderOf = $state<Team[]>([])

	// Le tiroir est monté pour tout responsable, mais nommer un responsable reste le fait des
	// administrateurs — `createInvite` refuse les autres.
	let isAdmin = $derived(!!page.data.member?.roles.includes('admin'))

	/**
	 * Une case désactivée n'est pas soumise, et celle-ci n'est renseignée qu'au premier clic:
	 * sans valeur, c'est l'état initial — coché — qui fait foi.
	 */
	let sendEmail = $derived(isEmailValid && (createInvite.fields.sendEmail.value() ?? true))

	/**
	 * Tant que l'évènement n'est pas publié, `[eventId]/+layout.svelte` réserve l'espace aux
	 * responsables: l'invité ne verra rien d'autre qu'une annonce. Autant le dire avant l'envoi.
	 */
	const accessHint: Partial<Record<EventState, string>> = {
		draft:
			`L'évènement n'étant pas encore publié: un bénévole n'y verra qu'une annonce « Bientôt disponible », ` +
			`tandis qu'un responsable ou un administrateur accède déjà à tout l'espace.`,
		archived: `L'évènement est archivé: seuls les responsables et les administrateurs y ont encore accès.`,
	}

	let hint = $derived(
		isEmailValid
			? accessHint[event.state]
			: `Renseigne un email valide pour envoyer une invitation.`
	)

	// Typé par sa forme et non par `Event`, qui désigne ici le modèle Prisma.
	async function handleEmailInput({ currentTarget }: { currentTarget: HTMLInputElement }) {
		email = currentTarget.value
		const { success } = z.safeParse(z.email(), email)
		isEmailValid = success
		if (!isEmailValid) return
		isLoadingUserExists = true
		try {
			const res = await findUserByEmail(email)
			if (!res) return
			user.firstName = res.firstName
			user.lastName = res.lastName
			toast.success('Utilisateur trouvé !')
		} finally {
			isLoadingUserExists = false
		}
	}

	/**
	 * Le tiroir n'est pas démonté à la fermeture: sans cela, l'invitation suivante repartirait
	 * avec les valeurs de la précédente. Les champs distants ont leur propre état — vider le
	 * `<form>` ne suffit pas.
	 */
	function reset() {
		createInvite.fields.set({
			firstName: '',
			lastName: '',
			email: '',
			sendEmail: true,
			leaderOf: [],
		})
		email = ''
		isEmailValid = false
		user = { firstName: '', lastName: '' }
		// Les cases cachées du multi-select se dérivent de cette liste, pas de l'état du champ.
		leaderOf = []
	}
</script>

<form
	{...createInvite.enhance(
		enhanceForm({
			// Le libellé du succès dépend de la case: le message est posé ici, pas en option.
			onsuccess: () => {
				toast.success(sendEmail ? 'Invitation envoyée' : 'Membre ajouté')
				// `result` porte le membre créé une fois la soumission résolue.
				if (createInvite.result) onCreate(createInvite.result)
				reset()
			},
		})
	)}
	class="flex flex-col gap-4"
>
	<div class="grid grid-cols-2 gap-4 my-6">
		<InputString
			label="Prénom"
			field={createInvite.fields.firstName}
			autocomplete="off"
			value={user.firstName}
		/>
		<InputString
			label="Nom"
			field={createInvite.fields.lastName}
			autocomplete="off"
			value={user.lastName}
		/>

		<div class="col-span-2 flex items-center gap-2">
			<InputString
				label="Email (optionnel)"
				class="grow"
				field={createInvite.fields.email}
				autocomplete="off"
				oninput={handleEmailInput}
			/>
			{#if isLoadingUserExists}
				<div transition:slide={{ axis: 'x' }} class="w-10 grid place-content-center">
					<div class="loading loading-ring loading-xs"></div>
				</div>
			{/if}
		</div>

		{#if isAdmin && !hideLeaderOf}
			<div class="col-span-2">
				<InputMultiSelect
					field={createInvite.fields.leaderOf}
					label="Responsable des secteurs"
					bind:value={leaderOf}
					items={searchTeams}
					placeholder="Aucun secteur"
					class="w-full"
				>
					{#snippet selected(team)}
						<span>{team.name}</span>
					{/snippet}
					{#snippet proposal(team)}
						<span>{team.name}</span>
					{/snippet}
					{#snippet append({ hide })}
						<a
							{...teamCall.link(
								{ from: 'invite', oncreated: (team) => (leaderOf = [...leaderOf, team]) },
								{ onclick: hide }
							)}
							class="btn btn-square btn-soft btn-sm"
							use:tip={{ content: 'Créer un nouveau secteur' }}
						>
							<PlusIcon size={20} />
						</a>
					{/snippet}
				</InputMultiSelect>
			</div>
		{/if}

		<div class="col-span-2">
			<InputBoolean
				label="Envoyer l'invitation par email"
				field={createInvite.fields.sendEmail}
				checked
				disabled={!isEmailValid}
				class={[!isEmailValid && 'opacity-60 bg-dash']}
				{hint}
			/>
		</div>
	</div>

	<div class="flex flex-row-reverse gap-2 border-t pt-4">
		<button class="btn btn-primary">Valider</button>
	</div>
</form>
