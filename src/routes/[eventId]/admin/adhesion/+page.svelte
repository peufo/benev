<script lang="ts">
	import { mdiLogin, mdiOpenInNew } from '@mdi/js'

	import { Card, Icon } from '$lib/fuma-legacy'

	import { MemberFields } from '$lib/member'
	import { EventSettingForm } from '$lib/event'
	import OnlyAdmin from '../OnlyAdmin.svelte'
	import { eventPath } from '$lib/store'

	let { data } = $props()
</script>

<OnlyAdmin>
	<Card class="mx-auto" style="min-width: min(100%, 600px)">
		{#snippet title()}
			<span class="flex gap-3">
				<Icon path={mdiLogin} class="opacity-70" />
				Adhésion des membres
			</span>
		{/snippet}

		<section>
			<EventSettingForm event={data.event} />
		</section>

		<div class="divider"></div>

		<section>
			<MemberFields fields={data.memberFields} />
		</section>

		<div class="divider"></div>

		<div class="flex justify-end">
			<a href="{$eventPath}/register?forcedStepIndex=1" target="_blank" class="btn btn-ghost">
				Aperçu du formulaire d'adhésion
				<Icon path={mdiOpenInNew} size={20} class="opacity-70" />
			</a>
		</div>
	</Card>
</OnlyAdmin>
