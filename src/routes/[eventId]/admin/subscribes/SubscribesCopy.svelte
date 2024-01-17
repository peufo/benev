<script lang="ts">
	import type { PageData } from './$types'
	import { CopyData } from '$lib/material'
	import { page } from '$app/stores'
	import { api } from '$lib/api'

	type Subscribe = PageData['subscribes'][number]

	const getData = async () => {
		const searchParams = $page.url.searchParams
		searchParams.append('all', 'true')
		const { subscribes } = await $api.get<{ subscribes: Subscribe[] }>(
			`/admin/subscribes?${searchParams.toString()}`
		)
		return subscribes
	}

	const columns: Record<string, (subscribe: Subscribe) => string | number> = {
		start: (s) => new Date(s.period.start).toLocaleString(),
		end: (s) => new Date(s.period.end).toLocaleString(),
		member_name: (s) => [s.member.user.firstName, s.member.user.lastName].join(' '),
		member_email: (s) => s.member.user.email,
		member_phone: (s) => s.member.user.phone || '',
		sector: (s) => s.period.team.name,
		created_by: (s) => s.createdBy,
		state: (s) => s.state,
	}
</script>

<CopyData {getData} {columns} />
