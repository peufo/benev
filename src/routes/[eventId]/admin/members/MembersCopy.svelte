<script lang="ts">
	import type { PageData } from './$types'
	import axios from 'axios'
	import { CopyData } from '$lib/material'
	import { getAge } from '$lib/utils'
	import { eventPath } from '$lib/store'
	import { page } from '$app/stores'

	type Member = PageData['members'][number]
	export let fields: PageData['fields']

	const getData = async () => {
		const searchParams = $page.url.searchParams
		searchParams.append('all', 'true')
		const { data } = await axios.get<{ members: Member[] }>(
			`${$eventPath}/admin/members?${searchParams.toString()}`
		)
		return data.members
	}

	const columns: Record<string, (member: Member) => string | number> = {
		name: (m) => `${m.user.firstName} ${m.user.lastName}`,
		email: (m) => m.user.email,
		phone: (m) => m.user.phone?.replace(/^\+/, "'+") || '',
		age: (m) => getAge(m.user.birthday),
		subscribes: (m) => m.subscribes.length,
		hours: (m) => m.workTime / (1000 * 60 * 60),
		leaderOf: (m) => m.leaderOf.map((team) => team.name).join(', '),
		...fields.reduce(
			(acc, cur) => ({
				...acc,
				[cur.name]: (m: Member) => {
					const value = m.profileJson[cur.id] || ''
					if (typeof value === 'string') return value.replaceAll('\r\n', ' ')
					return JSON.stringify(value)
				},
			}),
			{}
		),
	}
</script>

<CopyData {getData} {columns} />
