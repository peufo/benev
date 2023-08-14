<script lang="ts">
	import { mdiArrowLeft } from '@mdi/js'
	import { Icon } from '$lib/material'
	import { eventPath } from '$lib/store'
	import UserSubscribes from '$lib/me/UserSubscribes.svelte'

	export let data
</script>

<div class="flex">
	<a href="{$eventPath}/admin" class="btn btn-sm">
		<Icon path={mdiArrowLeft} />
		Les Bénévoles
	</a>

</div>

<UserSubscribes
	events={[data.event]}
	title="Les inscriptions de {data.userProfile.firstName} {data.userProfile.lastName}"
	eventNameVisible={false}
/>
