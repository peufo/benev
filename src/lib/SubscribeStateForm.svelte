<script lang="ts">
	import type { Subscribe } from '@prisma/client'
	import SubscribeState from '$lib/SubscribeState.svelte'
	import { useForm } from '$lib/form'
	import { enhance } from '$app/forms'
	import { Icon } from '$lib/material'
	import { mdiAlertOctagonOutline, mdiCheck } from '@mdi/js'

	export let subscribe: Subscribe
	export let action = ''

	const form = useForm({ successMessage: 'Status changé' })
</script>

<form method="post" use:enhance={form.submit}>
	<input type="hidden" name="id" value={subscribe.id} />

	<div class="dropdown dropdown-end">
		<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
		<!-- svelte-ignore a11y-label-has-associated-control -->
		<label tabindex="0" class="btn btn-square btn-sm">
			<SubscribeState state={subscribe.state} />
		</label>

		<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
		<ul tabindex="0" class="menu shadow dropdown-content z-10 bg-base-200 rounded-box">
			<li>
				<button formaction="{action}?/subscribe_accepted">
					<Icon path={mdiCheck} class="fill-success" />
					Accepter
				</button>
			</li>
			<li>
				<button formaction="{action}?/subscribe_denied">
					<Icon path={mdiAlertOctagonOutline} class="fill-warning" />
					Refuser
				</button>
			</li>
		</ul>
	</div>
</form>
