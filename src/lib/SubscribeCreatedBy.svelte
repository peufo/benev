<script lang="ts">
	import { Icon } from '$lib/material'
	import { mdiAccountCircleOutline, mdiShieldAccount } from '@mdi/js'

	export let createdBy: 'leader' | 'user'
	export let size = 24
</script>

{#if createdBy === 'leader'}
	<Icon path={mdiShieldAccount} title="Créer par un responsable" class="opacity-60" {size} />
{:else}
	<Icon path={mdiAccountCircleOutline} title="Créer par le membre" class="opacity-60" {size} />
{/if}
