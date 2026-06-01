import { formAction } from 'fuma/server'
import { permission, prisma } from '$lib/server'
import { faker } from '@faker-js/faker'
import { dev } from '$app/environment'
import dayjs from '$lib/dayjs'

export const actions = {
	update_members_avatarId: formAction({}, async ({ locals }) => {
		await permission.root(locals)
		const users = await prisma.user.findMany()
		let count = 0
		for (const user of users) {
			const res = await prisma.member.updateMany({
				where: { userId: user.id },
				data: { avatarId: user.avatarId },
			})
			count += res.count
		}
		return { count }
	}),

	anonymise: formAction({}, async ({ locals }) => {
		await permission.root(locals)

		if (!dev) {
			throw new Error('This migration is not available in production')
		}

		const members = await prisma.member.findMany({ where: { userId: null } })
		let count = 0

		function getFakeUser() {
			return {
				firstName: faker.person.firstName(),
				lastName: faker.person.lastName(),
				street: faker.location.street(),
				zipCode: faker.location.zipCode(),
				city: faker.location.city(),
				phone: faker.phone.number(),
				birthday: faker.date.birthdate(),
			}
		}

		for (const member of members) {
			await prisma.member.update({
				where: { id: member.id },
				data: getFakeUser(),
			})
			count++
		}

		const users = await prisma.user.findMany()
		for (const user of users) {
			const res = await prisma.user.update({
				where: { id: user.id },
				data: getFakeUser(),
				include: { members: { select: { id: true } } },
			})
			count += res.members.length
		}

		await prisma.user.updateMany({
			where: { avatarId: { not: null } },
			data: { avatarId: null },
		})
		await prisma.member.updateMany({
			where: { avatarId: { not: null } },
			data: { avatarId: null },
		})

		return { count }
	}),
	update_period_dates: formAction({}, async ({ locals }) => {
		await permission.root(locals)
		if (!dev) {
			throw new Error('This migration is not available in production')
		}
		const periods = await prisma.period.findMany({ where: { team: { eventId: 'woodstock-1969' } } })
		let count = 0
		for (const period of periods) {
			// const start = dayjs(period.start).set('y', 2026).set('m', 6).toDate()
			// const end = dayjs(period.end).set('y', 2026).set('m', 6).toDate()
			const start = dayjs(period.start).add(-2, 'd').toDate()
			const end = dayjs(period.end).add(-2, 'd').toDate()
			await prisma.period.update({
				where: { id: period.id },
				data: { start, end },
			})
			count++
		}
		return { count }
	}),
}
