<script lang="ts">
	import { slide } from 'svelte/transition'
	import { Dialog, InputBoolean, InputString } from 'fuma'
	import { page } from '$app/state'
	import Oauth from './Oauth.svelte'
	import TermsLabel from './TermsLabel.svelte'
	import { toast } from 'svelte-sonner'
	import { loginUser, registerUser, resetPassword } from './user.remote'

	interface Props {
		onSuccess?: () => unknown
	}

	let { onSuccess }: Props = $props()

	// `state` était le nom de la variable de mode, ce qui bloquait la migration vers les runes.
	let mode = $state<'login' | 'register'>('login')

	let redirectTo = $derived(page.url.searchParams.get('redirectTo'))

	let recorverDialog: HTMLDialogElement = $state()!

	async function handleAuth(submit: () => Promise<unknown>) {
		try {
			await submit()
			toast.success('Bienvenue')
			await onSuccess?.()
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err)
			toast.error(message)
			if (message.includes('This account already exists')) {
				mode = 'login'
				return
			}
			if (message.includes('This account already created from an invitation')) {
				recorverDialog.showModal()
			}
		}
	}
</script>

<div class="grid place-content-center p-10">
	<div
		style:width="min(24rem, calc(100vw - 1rem))"
		class="card place-content-center bg-base-100 shadow-xl"
	>
		<div class="tabs w-full">
			<span
				role="button"
				tabindex="0"
				class="tab tab-lg grow tab-lifted rounded-t-2xl"
				class:tab-active={mode === 'login'}
				onclick={() => (mode = 'login')}
				onkeyup={() => (mode = 'login')}
			>
				Connexion
			</span>
			<span
				role="button"
				tabindex="0"
				class="tab tab-lg grow tab-lifted rounded-t-2xl"
				class:tab-active={mode === 'register'}
				onclick={() => (mode = 'register')}
				onkeyup={() => (mode = 'register')}
			>
				Nouveau compte
			</span>
		</div>

		<!-- Trois remote functions sur un même `<form>`: SvelteKit n'exécute que celle dont
		     l'`action` correspond au `formaction` du bouton pressé. -->
		<form
			class="card-body border border-t-0 border-base-300"
			{...loginUser.enhance(({ submit }) => handleAuth(submit))}
			{...registerUser.enhance(({ submit }) => handleAuth(submit))}
			{...resetPassword.enhance(async ({ submit }) => {
				await submit()
				recorverDialog.close()
				mode = 'login'
				toast.success("Un lien de récupération t'a été envoyé par email")
			})}
		>
			{#if mode === 'register'}
				<div transition:slide|local class="flex flex-col gap-2">
					<div class="grid grid-cols-2 gap-2">
						<InputString field={registerUser.fields.firstName} label="Prénom" />
						<InputString field={registerUser.fields.lastName} label="Nom" />
					</div>
				</div>
			{/if}

			<InputString
				field={mode === 'login' ? loginUser.fields.email : registerUser.fields.email}
				label="Email"
				type="email"
				autocomplete="email"
				inputmode="email"
			/>
			<InputString
				field={mode === 'login' ? loginUser.fields.password : registerUser.fields.password}
				label="Mot de passe"
				type="password"
			/>

			{#if mode === 'register'}
				<div transition:slide|local class="flex flex-col mt-4">
					<InputBoolean field={registerUser.fields.isOrganizer} label="Je suis organisateur" />
					<!-- `InputBoolean` de fuma 2 ne prend qu'un libellé texte: le lien vers les
					     conditions se place juste en dessous. -->
					<InputBoolean
						field={registerUser.fields.isTermsAccepted}
						label="J'accepte les conditions d'utilisation"
					/>
					<div class="px-3 pt-1"><TermsLabel /></div>
				</div>
			{/if}

			{#if redirectTo}
				<input type="hidden" name="redirectTo" value={redirectTo} />
			{/if}

			<div class="card-actions flex-row-reverse items-center pt-4">
				<button class="btn" formaction={mode === 'login' ? loginUser.action : registerUser.action}>
					{mode === 'login' ? 'Connexion' : 'Valider'}
				</button>
				<div class="grow"></div>

				<button class="link link-hover" formaction={resetPassword.action}>
					Mot de passe oublié
				</button>
			</div>

			<Dialog bind:dialog={recorverDialog}>
				{#snippet header()}
					<h2 class="title">Ce compte éxiste déjà</h2>
				{/snippet}
				<p>Tu as été invité par un organisateur.</p>
				<div class="flex justify-end mt-4">
					<button formaction={resetPassword.action} class="btn">Récupérer mon compte</button>
				</div>
			</Dialog>
		</form>

		<div class="border border-t-0 rounded-b-2xl">
			<Oauth />

			<div class="text-center text-xs text-base-content/80 pb-4">
				En te connectant, tu acceptes
				<a href="/terms" class="link" target="_blank"> nos conditions d'utilisations </a>
			</div>
		</div>
	</div>
</div>
