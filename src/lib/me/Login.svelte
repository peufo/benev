<script lang="ts">
	import { resolve } from '$app/paths'
	import { slide } from 'svelte/transition'
	import { MediaQuery } from 'svelte/reactivity'
	import { isHttpError } from '@sveltejs/kit'
	import { InputBoolean, InputString } from 'fuma'
	import { toast } from 'svelte-sonner'
	import { page } from '$app/state'
	import { modelEmail } from '$lib/models'
	import { contextContainer } from '$lib/ui/context.js'
	import Oauth from './Oauth.svelte'
	import { loginUser, registerUser, resetPassword } from './user.remote'

	interface Props {
		onSuccess?: () => unknown
	}

	let { onSuccess }: Props = $props()

	/**
	 * L'invitation que porte le cookie, résolue par le layout racine. Elle nomme la personne, dit
	 * si elle a déjà un compte, et pré-remplit ce qu'on sait d'elle.
	 */
	const invite = $derived(page.data.invite)

	// `state` était le nom de la variable de mode, ce qui bloquait la migration vers les runes.
	// Un invité sans compte arrive directement sur « Créer un compte »: c'est le geste attendu.
	let mode = $state<'login' | 'register'>(
		page.data.invite && !page.data.invite.hasAccount ? 'register' : 'login'
	)

	/** Un compte créé par invitation n'a pas de mot de passe: la sortie est un lien de récupération. */
	let recoveryNeeded = $state(false)

	// Monté dans une `Card` (étape « Connexion » de l'inscription à un évènement), le composant
	// ne dessine pas sa propre surface: ce serait une card dans une card. Le titre descend d'un
	// niveau pour la même raison, la Card porte déjà le `h1`.
	const isEmbedded = !!contextContainer.get()

	const reducedMotion = new MediaQuery('(prefers-reduced-motion: reduce)')
	let slideDuration = $derived(reducedMotion.current ? 0 : 220)

	/**
	 * `resetPassword` est un `command()`, pas un `form()`: il n'a donc pas de champ où rendre ses
	 * erreurs, et c'est voulu — l'email affiché appartient à `loginUser`, deux sources d'issues sous
	 * le même input en empileraient les messages.
	 */
	let resetPasswordIssue = $state('')

	const RESET_COOLDOWN_S = 60
	let resetCooldown = $state(0)

	// L'effet se réexécute à chaque décrément, ce qui réarme le timer; son nettoyage couvre aussi
	// le démontage du composant.
	$effect(() => {
		if (resetCooldown <= 0) return
		const id = setTimeout(() => resetCooldown--, 1000)
		return () => clearTimeout(id)
	})

	let redirectTo = $derived(page.url.searchParams.get('redirectTo'))
	let isPending = $derived(loginUser.pending + registerUser.pending + resetPassword.pending > 0)

	/**
	 * Les deux formulaires ont des champs distincts: sans recopie, basculer de mode efface ce
	 * que la personne vient de taper.
	 */
	function setMode(next: 'login' | 'register') {
		if (next === mode) return
		const from = mode === 'login' ? loginUser.fields : registerUser.fields
		const to = next === 'login' ? loginUser.fields : registerUser.fields
		to.email.set(from.email.value() ?? '')
		to.password.set(from.password.value() ?? '')
		mode = next
	}

	function switchMode() {
		recoveryNeeded = false
		setMode(mode === 'login' ? 'register' : 'login')
	}

	/** `error()` traverse les remote functions en `HttpError`, qui n'est pas une `Error`. */
	function getErrorMessage(err: unknown): string {
		if (isHttpError(err)) return err.body.message
		if (err instanceof Error) return err.message
		return String(err)
	}

	async function handleAuth(submit: () => Promise<boolean>) {
		resetPasswordIssue = ''
		try {
			// `submit()` renvoie `false` quand la validation échoue: les messages sont déjà rendus
			// sous les champs concernés, il n'y a rien à annoncer en plus.
			if (!(await submit())) return
			toast.success(mode === 'login' ? 'Content de te revoir' : 'Bienvenue')
			await onSuccess?.()
		} catch (err) {
			const reason = getErrorMessage(err)

			if (reason.includes('This account already created from an invitation')) {
				recoveryNeeded = true
				setMode('login')
				return
			}
			if (reason.includes('This account already exists')) {
				setMode('login')
				toast.error('Un compte existe déjà avec cet email. Connecte-toi ci-dessous.')
				return
			}
			if (reason.includes('Invalid credentials')) {
				toast.error('Email ou mot de passe incorrect')
				return
			}

			console.error(err)
			toast.error(
				mode === 'login'
					? "La connexion n'a pas abouti. Réessaie dans un instant."
					: "La création du compte n'a pas abouti. Réessaie dans un instant."
			)
		}
	}

	async function handleReset() {
		// Validé ici plutôt que par le serveur: un `command()` lève au lieu de renvoyer des issues,
		// et `z.config(z.locales.fr())` ne tourne que dans `hooks.server.ts`. Les messages de
		// `modelEmail` étant écrits à la main, ils sont justes des deux côtés — et le tour est évité.
		const parsed = modelEmail.safeParse(loginUser.fields.email.value()?.trim() ?? '')
		if (!parsed.success) {
			resetPasswordIssue = parsed.error.issues[0].message
			return
		}

		resetPasswordIssue = ''
		try {
			await resetPassword(parsed.data)
			recoveryNeeded = false
			resetCooldown = RESET_COOLDOWN_S
			// Le serveur ne dit pas si l'adresse est connue, le message non plus.
			toast.success('Si un compte existe avec cet email, le lien vient de partir')
		} catch (err) {
			if (getErrorMessage(err).includes('Too many reset requests')) {
				resetPasswordIssue = 'Trop de demandes. Réessaie dans quelques minutes.'
				resetCooldown = RESET_COOLDOWN_S
				return
			}
			console.error(err)
			toast.error("L'envoi du lien a échoué. Réessaie dans un instant.")
		}
	}
</script>

{#snippet content()}
	{#if !isEmbedded}
		<h1 class="text-2xl font-bold text-primary">
			{#if invite}
				<span>Salut {invite.firstName} 👋</span>
			{:else}
				{mode === 'login' ? 'Connexion' : 'Créer un compte'}
			{/if}
		</h1>
		<p class="mt-1 text-sm text-base-content/70">
			{mode === 'login'
				? 'Retrouve tes évènements et tes inscriptions.'
				: 'Un seul compte suffit pour tous tes évènements.'}
		</p>
	{/if}

	<div class={isEmbedded ? '' : 'mt-6'}>
		<Oauth />
	</div>

	<div class="divider my-2 text-xs text-base-content/70">ou</div>

	<form
		class="flex flex-col gap-2 [&_.input]:w-full"
		{...loginUser.enhance(({ submit }) => handleAuth(submit))}
		{...registerUser.enhance(({ submit }) => handleAuth(submit))}
	>
		{#if mode === 'register'}
			<div transition:slide|local={{ duration: slideDuration }} class="grid grid-cols-2 gap-3">
				<InputString
					field={registerUser.fields.firstName}
					value={invite?.firstName}
					label="Prénom"
					variant="block"
					autocomplete="given-name"
				/>
				<InputString
					field={registerUser.fields.lastName}
					value={invite?.lastName}
					label="Nom"
					variant="block"
					autocomplete="family-name"
				/>
			</div>
		{/if}

		<!--
			`value` est la valeur *initiale* du champ: fuma la passe à `field.as(type, value)`, qui ne
			la consulte que tant que rien n'a été saisi. Rendue au SSR, effacée par la première
			frappe — exactement ce qu'on veut d'un pré-remplissage.
		-->
		<InputString
			field={mode === 'login' ? loginUser.fields.email : registerUser.fields.email}
			value={invite?.email}
			label="Email"
			variant="block"
			type="email"
			autocomplete="email"
			inputmode="email"
			oninput={() => (resetPasswordIssue = '')}
		/>
		{#if resetPasswordIssue && !loginUser.fields.email.issues()?.length}
			<p class="mb-1 text-xs text-error" transition:slide={{ duration: 200 }}>
				{resetPasswordIssue}
			</p>
		{/if}
		<InputString
			field={mode === 'login' ? loginUser.fields.password : registerUser.fields.password}
			label="Mot de passe"
			variant="block"
			type="password"
			autocomplete={mode === 'login' ? 'current-password' : 'new-password'}
		/>

		{#if mode === 'register'}
			<div transition:slide|local={{ duration: slideDuration }} class="flex flex-col gap-2 pt-2">
				<InputBoolean field={registerUser.fields.isOrganizer} label="Je suis organisateur" />
				<InputBoolean
					field={registerUser.fields.isTermsAccepted}
					label="J'accepte les conditions générales et la politique de confidentialité"
				/>
			</div>
		{/if}

		{#if redirectTo}
			<input type="hidden" name="redirectTo" value={redirectTo} />
		{/if}

		<button
			class="btn btn-primary mt-4 w-full"
			formaction={mode === 'login' ? loginUser.action : registerUser.action}
			disabled={isPending}
		>
			{#if isPending}
				<span class="loading loading-spinner loading-sm"></span>
			{/if}
			{mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
		</button>

		{#if recoveryNeeded}
			<div
				role="status"
				transition:slide|local={{ duration: slideDuration }}
				class="mt-2 rounded-2xl border border-soft bg-secondary/10 p-4"
			>
				<p class="font-semibold text-primary">Ce compte a été créé par un organisateur</p>
				<p class="mt-1 text-sm leading-relaxed text-base-content/80">
					Tu as été invité avec cet email, mais tu n'as pas encore choisi de mot de passe. On
					t'envoie un lien pour en définir un.
				</p>
				<button
					type="button"
					class="btn btn-primary btn-sm mt-3 w-full"
					onclick={handleReset}
					disabled={isPending || resetCooldown > 0}
				>
					Recevoir le lien
				</button>
			</div>
		{/if}

		{#if mode === 'login'}
			<button
				type="button"
				class="link link-hover mx-auto py-2 text-sm text-base-content/70 disabled:opacity-60"
				onclick={handleReset}
				disabled={isPending || resetCooldown > 0}
			>
				{resetCooldown ? `Renvoyer dans ${resetCooldown} s` : 'Mot de passe oublié ?'}
			</button>
		{/if}
	</form>

	<div class="mt-5 border-t border-soft pt-5 text-center text-sm text-base-content/70">
		{mode === 'login' ? 'Pas encore de compte ?' : 'Tu as déjà un compte ?'}
		<button type="button" class="link link-primary font-semibold" onclick={switchMode}>
			{mode === 'login' ? 'Créer un compte' : 'Se connecter'}
		</button>
	</div>

	<p class="mt-4 text-center text-xs text-balance text-base-content/70">
		En continuant, tu acceptes nos
		<a href={resolve('/terms')} class="link" target="_blank">conditions générales</a>
		et notre
		<a href={resolve('/privacy')} class="link" target="_blank">politique de confidentialité</a>.
	</p>
{/snippet}

{#if isEmbedded}
	<div class="mx-auto w-full max-w-md">
		{@render content()}
	</div>
{:else}
	<div class="card mx-auto w-full max-w-md border border-soft bg-base-100 shadow-lg">
		<div class="card-body gap-0 p-6 sm:p-8">
			{@render content()}
		</div>
	</div>
{/if}
