<script lang="ts">
	import { slide } from 'svelte/transition'
	import { useForm, InputText, InputPassword, Dialog, InputBoolean } from 'fuma'
	import { page } from '$app/stores'
	import Oauth from './Oauth.svelte'
	import TermsLabel from './TermsLabel.svelte'
	import { toast } from 'svelte-sonner'

	export let onSuccess:
		| ((action: URL, data?: Record<string, unknown> | undefined) => any)
		| undefined = undefined

	const { enhance } = useForm({
		onSuccess,
		successMessage(action) {
			if (action.search === '?/reset_password') {
				recorverDialog.close()
				state = 'login'
				return "Un lien de récupération t'a été envoyé par email"
			}
			return 'Bienvenue'
		},
		onFail(failure) {
			toast.error(JSON.stringify(failure))
		},
		onError(err) {
			toast.error(err)
			if (err === 'This account already exists') {
				state = 'login'
				return
			}
			if (err === 'This account already created from an invitation') {
				recorverDialog.showModal()
				return
			}
		},
	})
	let state: 'login' | 'register' = 'login'

	$: redirectTo = $page.url.searchParams.get('redirectTo')

	let recorverDialog: HTMLDialogElement
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
				class:tab-active={state === 'login'}
				on:click={() => (state = 'login')}
				on:keyup={() => (state = 'login')}
			>
				Connexion
			</span>
			<span
				role="button"
				tabindex="0"
				class="tab tab-lg grow tab-lifted rounded-t-2xl"
				class:tab-active={state === 'register'}
				on:click={() => (state = 'register')}
				on:keyup={() => (state = 'register')}
			>
				Nouveau compte
			</span>
		</div>

		<form class="card-body border border-t-0 border-base-300" method="post" use:enhance>
			{#if state === 'register'}
				<div transition:slide|local class="flex flex-col gap-2">
					<div class="grid grid-cols-2 gap-2">
						<InputText key="firstName" label="Prénom" />
						<InputText key="lastName" label="Nom" />
					</div>
				</div>
			{/if}

			<InputText key="email" label="Email" input={{ autocomplete: 'email', inputmode: 'email' }} />
			<InputPassword key="password" label="Mot de passe" />

			{#if state === 'register'}
				<div transition:slide|local class="flex flex-col mt-4">
					<InputBoolean key="isOrganizer" label="Je suis organisateur" labelPosition="right" />
					<InputBoolean key="isTermsAccepted" label={TermsLabel} labelPosition="right" />
				</div>
			{/if}

			{#if redirectTo}
				<input type="hidden" name="redirectTo" value={redirectTo} />
			{/if}

			<div class="card-actions flex-row-reverse items-center pt-4">
				<button class="btn" formaction="/me{state === 'login' ? '?/login' : '?/register'}">
					{state === 'login' ? 'Connexion' : 'Valider'}
				</button>
				<div class="grow" />

				<button class="link link-hover" formaction="/me?/reset_password">
					Mot de passe oublié
				</button>
			</div>

			<Dialog bind:dialog={recorverDialog}>
				<h2 class="title" slot="header">Ce compte éxiste déjà</h2>
				<p>Tu as été invité par un organisateur.</p>
				<div class="flex justify-end mt-4">
					<button formaction="/me?/reset_password" class="btn">Récupérer mon compte</button>
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
