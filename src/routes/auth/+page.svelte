<script lang="ts">
	import { enhance } from '$app/forms'
	import { InputText, InputPassword } from '$lib/material'
	import { useForm } from '$lib/form'
	import { slide } from 'svelte/transition'
	import Profile from './Profile.svelte'

	export let data

	const form = useForm()
	let state: 'login' | 'register' = 'register'
</script>

{#if data.user}

	<Profile user={data.user}/>

{:else}

<div class="grid h-full place-content-center p-10">
	<div class="card w-96 place-content-center bg-base-100 shadow-xl">
		<div class="tabs w-full">
			<span
				role="button"
				tabindex="0"
				class="tab tab-lg grow tab-lifted"
				class:tab-active={state === 'login'}
				on:click={() => (state = 'login')}
				on:keyup={() => (state = 'login')}
			>
				Connexion
			</span>
			<span
				role="button"
				tabindex="0"
				class="tab tab-lg grow tab-lifted"
				class:tab-active={state === 'register'}
				on:click={() => (state = 'register')}
				on:keyup={() => (state = 'register')}
			>
				Nouveau compte
			</span>
		</div>

		<form
			class="card-body border border-t-0 border-base-300 rounded-b-xl"
			method="post"
			use:enhance={form.submit}
		>
			{#if state === 'register'}
				<div transition:slide|local class="flex flex-col gap-2">

					<div class="grid grid-cols-2 gap-2">
						<InputText key="firstName" label="Prénom"/>
						<InputText key="lastName" label="Nom"/>
					</div>

					<InputText key="phone" label="Téléphone"/>
				</div>
			{/if}

			<InputText key="email" label="Email" />
			<InputPassword key="password" label="Mot de passe" />

			<div class="card-actions justify-end">
				<input
					type="submit"
					class="btn-neutral btn"
					value={state === 'login' ? 'Connexion' : 'Créer un compte'}
					formaction={state === 'login' ? '?/login' : '?/register'}
				/>
			</div>
		</form>
	</div>
</div>

{/if}
