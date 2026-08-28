<script lang="ts">
	import type { Event } from '@prisma/client'
	import { CopyIcon, LinkIcon, TriangleAlertIcon, UserRoundPlusIcon } from '@lucide/svelte'
	import { urlParam, useCopy } from 'fuma'
	import { page } from '$app/state'
	import { eventPath } from '$lib/eventPath'

	let { event }: { event: Event } = $props()

	// `eventPath` rend un chemin relatif: le lien à diffuser doit être résolu contre la page
	// courante pour redevenir une URL entière.
	const shareUrl = $derived(new URL(eventPath(''), page.url).href)
	const copy = $derived(useCopy({ value: () => shareUrl, successMessage: 'Lien copié' }))
</script>

<div class="flex flex-col gap-3 rounded-box border border-soft p-4">
	<div class="flex gap-2">
		<div>
			<h3 class="title-md">Partage</h3>
			<span class="text-sm text-base-content/80">L'adresse du site, à diffuser aux bénévoles.</span>
		</div>

		<a
			class="btn btn-sm ml-auto btn-secondary"
			href={urlParam.with({ form_invite: '{}' })}
			data-sveltekit-noscroll
			data-sveltekit-replacestate
		>
			<UserRoundPlusIcon size={20} class="opacity-70" />
			Inviter un membre
		</a>
	</div>

	<div class="join w-full">
		<label class="input join-item w-full">
			<LinkIcon size={18} class="opacity-70" />
			<input
				type="text"
				readonly
				value={shareUrl}
				aria-label="Lien de partage"
				onfocus={(e) => e.currentTarget.select()}
			/>
		</label>
		<button type="button" class="btn join-item" {...copy}>
			<CopyIcon size={20} class="opacity-70" />
			Copier
		</button>
	</div>

	{#if event.state === 'draft'}
		<p class="italic text-xs">
			Ce lien n'est pas pertinent tant que l'évènement n'est pas publié.<br />
			Mais tu peux déjà inviter les administrateur·ices et les responsables de secteur.
		</p>
	{/if}
</div>
