<script lang="ts">
	import { slide } from 'svelte/transition'
	import { enhance } from '$app/forms'
	import { InputText, InputPassword, Icon } from '$lib/material'
	import { useForm } from '$lib/validation'
	import { page } from '$app/stores'
	import googleLogo from '$lib/assets/google.svg'
	import { mdiGithub } from '@mdi/js'
	import { tip } from '$lib/action'
	import InputBoolean from '$lib/material/input/InputBoolean.svelte'

	const form = useForm({
		successMessage(action) {
			if (action.search === '?/reset_password')
				return "Un lien de réinitialisation t'a été envoyé par email"
			return 'Bienvenue'
		},
	})
	let state: 'login' | 'register' = 'register'

	$: redirectTo = $page.url.searchParams.get('redirectTo')
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

		<form
			class="card-body border border-t-0 border-base-300"
			method="post"
			use:enhance={form.submit}
		>
			{#if state === 'register'}
				<div transition:slide|local class="flex flex-col gap-2">
					<div class="grid grid-cols-2 gap-2">
						<InputText key="firstName" label="Prénom" />
						<InputText key="lastName" label="Nom" />
					</div>
				</div>
			{/if}

			<InputText key="email" label="Email" />
			<InputPassword key="password" label="Mot de passe" />

			{#if state === 'register'}
				<div transition:slide|local class="flex flex-col mt-4">
					<InputBoolean key="isOrganizer" label="Je suis organisateur" />
					<InputBoolean key="isTermsAccepted">
						J'accepte
						<a class="text-sm link" href="/terms" target="_blank"> les conditions d'utilisation </a>
					</InputBoolean>
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
		</form>

		<div class="border border-t-0 rounded-b-2xl">
			<div class="flex p-4 gap-4 justify-center">
				<a
					href="/auth/google"
					class="btn btn-square"
					data-sveltekit-preload-data="off"
					data-sveltekit-preload-code="off"
					use:tip={{ content: 'Connexion avec Google' }}
				>
					<img src={googleLogo} alt="Logo Google" />
				</a>

				<a
					href="/auth/github"
					class="btn btn-square"
					data-sveltekit-preload-data="off"
					data-sveltekit-preload-code="off"
				>
					<Icon path={mdiGithub} title="Connexion avec Github" />
				</a>
			</div>

			<div class="text-center text-xs text-base-content/80 pb-4">
				En te connectant, tu acceptes
				<a href="/terms" class="link" target="_blank"> nos conditions d'utilisations </a>
			</div>
		</div>
	</div>
</div>
