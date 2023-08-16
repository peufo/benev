<script lang="ts">
	import { mdiArrowLeft } from '@mdi/js'
	import { Icon } from '$lib/material'
	import { eventPath } from '$lib/store'
	import UserSubscribes from '$lib/me/UserSubscribes.svelte'
	import Profile from './Profile.svelte'

	export let data
</script>

<div class="flex">
	<a href="{$eventPath}/admin" class="btn btn-xs btn-ghost pl-0">
		<Icon path={mdiArrowLeft} size={16} />
		Les Bénévoles
	</a>
</div>

<div class="flex flex-col gap-6">
	<Profile user={data.memberProfile.user} />

	<UserSubscribes events={[data.event]} title="" eventNameVisible={false} isEditor />
</div>
