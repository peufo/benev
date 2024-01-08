type App = {
	name: string
	href: string
	currency?: 'CHF' | 'EUR' | 'USD'
	getTarif: (events: number, members: number) => number
	conditions?: string
	hide?: string
}

export const apps: App[] = [
	{
		name: 'benev.io',
		href: 'https://benev.io',
		getTarif: (events, members) => events * (10 + 0.5 * members),
	},
	{
		name: 'Qo·ezion',
		href: 'https://www.qoezion.com',
		currency: 'EUR',
		getTarif: (events, members) => {
			const licences = Math.max(events * members - 200, 0)
			return 540 + licences * 2
		},
	},
	{
		name: 'Swiss Volunteers',
		href: 'https://www.swissvolunteers.ch',
		getTarif: (events, members) => {
			const discount = events * 700
			const licences = Math.max(members - 100, 0)
			return events * (1000 + licences * 10) - discount
		},
		conditions:
			'Inclut une réduction de prix de 700CHF à condition de faire de la publicité pour Swiss Volunteers',
	},
	{
		name: 'Volunteo',
		href: 'https://volunteo.com',
		currency: 'EUR',
		getTarif: (events, members) => {
			const licences = Math.max(members - 10, 0)
			return events * licences
		},
	},
	{
		name: 'You Staff',
		href: 'https://youstaff.net',
		getTarif: (events, members) => {
			const eventsCost = 250 + (events - 1) * 150
			return eventsCost + events * members * 1.5
		},
	},
	{
		name: 'EHRO',
		href: 'https://ehro.app',
		getTarif: (events, members) => {
			const eventsCost = Math.min(events * 200, 500)
			return eventsCost + events * members * 3
		},
	},
	{
		name: 'Recrewteer',
		href: 'https://recrewteer.com',
		currency: 'EUR',
		getTarif: (events, members) => {
			if (members <= 200) return 700 * events
			return 1500 * events
		},
	},
	{
		name: 'volunteerlocal',
		href: 'https://www.volunteerlocal.com',
		currency: 'USD',
		getTarif: (events) => {
			const eventsCost = Math.min(200 * events, 600)
			return eventsCost
		},
	},
	{
		name: 'Rosterfy',
		href: 'https://www.rosterfy.com',
		currency: 'USD',
		getTarif: () => 10_000,
		hide: 'Tarif not found',
	},
]
