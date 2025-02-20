<script lang="ts">
	import type { PageData } from './$types'
	import { page } from '$app/stores'
	import { api } from '$lib/api'
	import { getCSV, ButtonCopy } from 'fuma'
	import { mdiTrayArrowDown } from '@mdi/js'

	type Subscribe = PageData['subscribes'][number]

	const getSubscribesCSV = async () => {
		const searchParams = $page.url.searchParams
		searchParams.append('all', 'true')
		const { subscribes } = await $api.get<{ subscribes: Subscribe[] }>(
			`/admin/subscribes?${searchParams.toString()}`
		)

		return getCSV(subscribes, columns)
	}

	const columns: Record<string, (subscribe: Subscribe) => string | number> = {
		start: (s) => new Date(s.period.start).toLocaleString(),
		end: (s) => new Date(s.period.end).toLocaleString(),
		member_name: (s) => [s.member.user.firstName, s.member.user.lastName].join(' '),
		member_email: (s) => s.member.user.email,
		member_phone: (s) => s.member.user.phone || '',
		sector: (s) => s.period.team.name,
		created_by: (s) => s.createdBy,
		created_at: (s) => s.createdAt.toJSON(),
		state: (s) => s.state,
	}
</script>

<ButtonCopy value={getSubscribesCSV} title="Copier les données" icon={mdiTrayArrowDown} />
