<script lang="ts">
	import { slide } from 'svelte/transition'
	import { enhance } from '$app/forms'
	import { InputText, InputPassword, Icon } from '$lib/material'
	import { useForm } from '$lib/form'
	import { page } from '$app/stores'
	import googleLogo from '$lib/assets/google.svg'
	import { mdiGithub } from '@mdi/js'
	import { tip } from '$lib/action'

	const form = useForm({
		successMessage: (action) => {
			if (action.search === '?/reset_password')
				return "Un lien de réinitialisation t'a été envoyé par email"
			return 'Bienvenue'
		},
	})
	let state: 'login' | 'register' = 'login'
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

		<form class="card-body border border-t-0 border-base-300" method="post" use:enhance={form.submit}>
			{#if state === 'register'}
				<div transition:slide|local class="flex flex-col gap-2">
					<div class="grid grid-cols-2 gap-2">
						<InputText key="firstName" label="Prénom" />
						<InputText key="lastName" label="Nom" />
					</div>

					<InputText key="phone" label="Téléphone" />
				</div>
			{/if}

			<InputText key="email" label="Email" />
			<InputPassword key="password" label="Mot de passe" />

			{#if $page.url.searchParams.get('callback')}
				<input type="hidden" name="callback" value={$page.url.searchParams.get('callback')} />
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

		<div class="flex p-4 gap-4 justify-center">
			<a href="/auth/google" class="btn btn-square" use:tip={{ content: 'Connection avec Google' }}>
				<img src={googleLogo} alt="Logo Google" />
			</a>

			<a href="/auth/github" class="btn btn-square">
				<Icon path={mdiGithub} title="Connection avec Github" />
			</a>
		</div>
	</div>
</div>
