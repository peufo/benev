<script lang="ts">
	import type { PageData } from './$types'
	import { mdiTrayArrowDown } from '@mdi/js'
	import { Icon } from '$lib/material'
	import { useNotify } from '$lib/notify'
	import { getAge } from '$lib/utils'

	type Member = PageData['members'][number]

	export let members: Member[]
	export let fields: PageData['fields']
	export let selectedColumnsId: string[] = []

	const notify = useNotify()

	function handleCopy() {
		const csv = getCSV()

		navigator.clipboard
			.writeText(csv)
			.then(() => {
				notify.success(`Données prêtes à être collé dans un tableur`)
			})
			.catch((error) => {
				notify.error(error)
			})
	}

	function getCSV(): string {
		console.log(selectedColumnsId)
		const columns: Record<string, (member: Member) => string | number> = {
			name: (m) => `${m.user.firstName} ${m.user.lastName}`,
			email: (m) => m.user.email,
			phone: (m) => m.user.phone?.replace(/^\+/, "'+") || '',
			age: (m) => getAge(m.user.birthday),
			subscribes: (m) => m.subscribes.length,
			hours: (m) =>
				m.subscribes
					.map(({ period: { start, end } }) => end.getTime() - start.getTime())
					.reduce((acc, cur) => acc + cur, 0) /
				(1000 * 60 * 60),
			leaderOf: (m) => m.leaderOf.map((team) => team.name).join(', '),
			...fields.reduce(
				(acc, cur) => ({
					...acc,
					[cur.name]: (m: Member) => {
						const value = m.profile.find(({ fieldId }) => fieldId === cur.id)?.value || ''
						return value.replaceAll('\r\n', ' ')
					},
				}),
				{}
			),
		}

		const headers = Object.keys(columns).join('\t')
		const rows = members.map((m: Member) =>
			Object.values(columns)
				.map((getValue) => getValue(m))
				.join('\t')
		)
		return [headers, rows.join('\r\n')].join('\r\n')
	}
</script>

<button class="btn btn-square btn-sm" on:click={handleCopy}>
	<Icon path={mdiTrayArrowDown} size={20} title="Copier les données" />
</button>
