<script lang="ts">
	import { ButtonCopy, getCSV } from 'fuma'
	import type { PageData } from './$types'
	import { getAge } from '$lib/utils'
	import { page } from '$app/stores'
	import { api } from '$lib/api'
	import { mdiTrayArrowDown } from '@mdi/js'

	type Member = PageData['members'][number]
	export let fields: PageData['fields']

	const getMembersCSV = async () => {
		const searchParams = $page.url.searchParams
		searchParams.append('all', 'true')
		const { members } = await $api.get<{ members: Member[] }>(
			`/admin/members?${searchParams.toString()}`
		)

		return getCSV(members, columns)
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
					const value = (m.profileJson && m.profileJson[cur.id]) || ''
					if (typeof value === 'string') return value.replaceAll('\r\n', ' ')
					return JSON.stringify(value)
				},
			}),
			{}
		),
	}
</script>

<ButtonCopy value={getMembersCSV} title="Copier les données" icon={mdiTrayArrowDown} />
