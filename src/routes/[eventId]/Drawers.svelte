<script lang="ts">
	import { Drawer } from 'fuma'
	import type { LayoutData } from './$types'
	import InviteForm from '$lib/InviteForm.svelte'
	import { FormTeam } from '$lib/team'

	export let data: LayoutData
</script>

{#if data.member?.roles.includes('leader')}
	<Drawer key="form-invite" title="Inviter un nouveau membre" let:close>
		<InviteForm
			options={{
				onSuccess: ({ searchParams }, data) =>
					close().then(() => {
						if (searchParams.has('/invite_create') && !!data) {
							console.log('Set new member in FormTeam', data)
						}
					}),
			}}
		/>
	</Drawer>

	<Drawer key="team_form" title={data.team ? 'Modifier du secteur' : 'Nouveau secteur'} let:close>
		<FormTeam event={data.event} team={data.team} on:success={() => close()} />
	</Drawer>
{/if}
