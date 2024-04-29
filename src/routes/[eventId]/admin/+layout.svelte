<script lang="ts">
	import { Card } from 'fuma'
	import { useNotify } from '$lib/notify'
	import { adminTabs } from '../../../lib/layout/adminTabs'
	import { CheckoutWaitSSE } from '$lib/checkout'

	export let data

	$: activeTab = $adminTabs.find(({ isActive }) => isActive)

	const notify = useNotify()

	function handleClickLicence(event: MouseEvent | KeyboardEvent) {
		if (!data.member?.roles.includes('owner')) {
			event.preventDefault()
			notify.warning('Seul le propriétaire peut obtenir des licences pour cet évenement')
		}
	}
</script>

<div class="flex flex-col gap-4 max-w-5xl m-auto">
	{#if !!data.event.missingLicencesMember}
		<div class="bg-error/5 border-2 rounded-xl p-2 pl-4 border-error flex gap-4 items-center">
			<span class="font-semibold">
				Oups, il manque {data.event.missingLicencesMember > 1
					? `${data.event.missingLicencesMember} licences`
					: 'une licence'} de membre
			</span>
			<a
				href="/me/licences/checkout?licence_event=0&licence_member=200"
				on:click={handleClickLicence}
				on:keydown={handleClickLicence}
				class="btn btn-primary ml-auto"
			>
				Obtenir
			</a>
		</div>
	{/if}

	<CheckoutWaitSSE removeCheckoutId />

	<slot />
</div>
