<script lang="ts">
	import { page } from '$app/stores'
	import { Card, Icon, InputSearch } from '$lib/material'
	import { eventPath, urlParam } from '$lib/store'
	import {
		mdiSigma,
		mdiListBoxOutline,
		mdiAccountGroup,
		mdiClipboardTextMultipleOutline,
	} from '@mdi/js'

	let view: 'table' | 'summary'
	$: view = $urlParam.hasValue('view', 'summary') ? 'summary' : 'table'
	$: isMemberTab = $page.route.id?.startsWith('/[eventId]/admin/manage/members')
</script>

<Card headerClass="items-end">
	<div slot="title" class="tabs -translate-y-2">
		<a
			href="{$eventPath}/admin/manage/members"
			class="tab tab-lg tab-bordered group"
			class:tab-active={isMemberTab}
		>
			<Icon
				path={mdiAccountGroup}
				class="mr-2 {isMemberTab ? '' : 'opacity-50 group-hover:opacity-100'}"
			/>
			Membres
		</a>
		<a
			href="{$eventPath}/admin/manage/subscribes"
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
		<div class="join">
			<a
				class="
					btn btn-sm btn-square join-item
					{view === 'table' ? 'btn-active' : 'opacity-70'}
				"
				href={$urlParam.with({ view: 'table' })}
			>
				<Icon path={mdiListBoxOutline} title="Table" class="fill-base-content" />
			</a>
			<a
				class="
					btn btn-sm btn-square join-item
					{view === 'summary' ? 'btn-active' : 'opacity-70'}
				"
				href={$urlParam.with({ view: 'summary' })}
			>
				<Icon path={mdiSigma} title="Synthèse" class="fill-base-content" />
			</a>
		</div>

		<InputSearch />
	</div>

	<slot />
</Card>
