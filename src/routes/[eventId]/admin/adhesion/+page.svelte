<script lang="ts">
	import { mdiLogin, mdiOpenInNew } from '@mdi/js'

	import { Card, Icon } from 'fuma'

	import { MemberFields, MemberSettingsForm } from '$lib/member'
	import OnlyAdmin from '../OnlyAdmin.svelte'
	import { eventPath } from '$lib/store'

	export let data
</script>

<OnlyAdmin>
	<Card class="mx-auto" style="min-width: min(100%, 600px)">
		<span slot="title" class="flex gap-3">
			<Icon path={mdiLogin} class="opacity-70" />
			Adhésion des membres
		</span>
		<span slot="subtitle">Paramétrage du processus d'adhésion et d'inscription</span>

		<section>
			<MemberSettingsForm event={data.event} />
		</section>

		<div class="divider" />

		<section>
			<MemberFields fields={data.memberFields} />
		</section>

		<div class="divider" />

		<div class="flex justify-end">
			<a href="{$eventPath}/register?forcedStepIndex=1" target="_blank" class="btn btn-ghost">
				Aperçu du formulaire d'adhésion
				<Icon path={mdiOpenInNew} size={20} class="opacity-70" />
			</a>
		</div>
	</Card>
</OnlyAdmin>
