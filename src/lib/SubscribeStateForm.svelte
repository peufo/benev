<script lang="ts">
	import type { Subscribe } from '@prisma/client'
	import SubscribeState from '$lib/SubscribeState.svelte'
	import { useForm } from '$lib/form'
	import { enhance } from '$app/forms'
	import { Icon } from '$lib/material'
	import { mdiCloseOctagonOutline, mdiCheck } from '@mdi/js'
	import { page } from '$app/stores'

	export let subscribe: Subscribe
	export let isMember = false
	export let isLeader = false
	export let eventId = $page.params.eventId
	export let action = `/${eventId}/subscribes/${subscribe.id}`

	$: canEdit =
		(isMember && subscribe.createdBy === 'leader') || (isLeader && subscribe.createdBy === 'user')

	const form = useForm({ successMessage: 'Status changé' })
</script>

{#if !canEdit}
	<button class="btn-square btn-sm cursor-default">
		<SubscribeState {subscribe} />
	</button>
{:else}
	<form method="post" use:enhance={form.submit} class="h-8">
		<div class="dropdown dropdown-end">
			<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label tabindex="0" class="btn btn-square btn-sm">
				<SubscribeState {subscribe} />
			</label>

			<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
			<ul tabindex="0" class="menu shadow dropdown-content z-10 bg-base-200 rounded-box">
				<li>
					<button formaction="{action}?/subscribe_accepted">
						<Icon path={mdiCheck} class="fill-success" />
						Confirmer
					</button>
				</li>
				<li>
					<button formaction="{action}?/subscribe_denied">
						<Icon path={mdiCloseOctagonOutline} class="fill-error" />
						Refuser
					</button>
				</li>
			</ul>
		</div>
	</form>
{/if}
