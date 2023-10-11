<script lang="ts">
	import { page } from '$app/stores'
	import { Card, Icon, InputSearch } from '$lib/material'
	import { eventPath, param } from '$lib/store'
	import { mdiAccountMultipleOutline, mdiClipboardTextMultipleOutline } from '@mdi/js'

	$: isMemberTab = $page.route.id?.startsWith('/[eventId]/admin/manage/members')
</script>

<Card headerClass="items-end">
	<div slot="title" class="tabs -translate-y-2">
		<a
			href="{$eventPath}/admin/manage/members{$param.without('skip', 'take')}"
			class="tab tab-lg tab-bordered group"
			class:tab-active={isMemberTab}
		>
			<Icon
				path={mdiAccountMultipleOutline}
				class="mr-2 {isMemberTab ? '' : 'opacity-50 group-hover:opacity-100'}"
			/>
			Membres
		</a>
		<a
			href="{$eventPath}/admin/manage/subscribes{$param.without('skip', 'take')}"
			class="tab tab-lg tab-bordered tab-active group"
			class:tab-active={!isMemberTab}
		>
			<Icon
				path={mdiClipboardTextMultipleOutline}
				class="mr-2 {isMemberTab ? 'opacity-50 group-hover:opacity-100' : ''}"
			/>
			Inscriptions
		</a>
	</div>

	<div slot="action" class="flex gap-2">
		<InputSearch />
	</div>

	<slot />
</Card>
