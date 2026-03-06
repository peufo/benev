import { Prisma, PrismaClient, type Member, type User } from '@prisma/client'
import { createId } from '@paralleldrive/cuid2'
import { createAvatarPlaceholder } from 'fuma'

export const prisma = new PrismaClient().$extends({
	query: {
		period: {
			async create({ args, query }) {
				const result = await query(args)
				if (result.id) {
					await eventDatesIncludePeriod({ id: result.id })
				}
				return result
			},
			async update({ args, query }) {
				const result = await query(args)
				await eventDatesIncludePeriod(args.where)
				return result
			},
			async delete({ args, query }) {
				const { eventId } = await prisma.period
					.findUniqueOrThrow({ where: args.where })
					.team({ select: { eventId: true } })
				const result = await query(args)
				await eventDatesRefresh(eventId)
				return result
			},
		},
		event: {
			async delete({ args: { where } }) {
				const event = await prisma.event.findUniqueOrThrow({ where })
				const deletedId = createId()
				const id = `deleted_${event.id}_${deletedId}`
				const name = `deleted_${event.name}_${deletedId}`
				await prisma.event.update({ where, data: { id, name, deletedAt: new Date() } })
				return true
			},
		},
		user: {
			async update({ args, query }) {
				const data: Prisma.MemberUpdateInput = {}
				function copy<K extends keyof User & keyof Member>(key: K) {
					if (args.data[key] !== undefined) data[key] = args.data[key]
				}
				copy('email')
				copy('isEmailVerified')
				copy('firstName')
				copy('lastName')
				copy('phone')
				copy('birthday')
				copy('street')
				copy('zipCode')
				copy('city')
				copy('avatarId')
				copy('avatarPlaceholder')
				await prisma.member.updateMany({ where: { user: args.where }, data })
				return query(args)
			},
			async delete({ args, query }) {
				const user = await prisma.user.findUniqueOrThrow(args)
				await prisma.member.updateMany({
					where: { userId: user.id },
					data: {
						email: null,
						isEmailVerified: false,
						phone: null,
						firstName: 'Deleted',
						lastName: 'User',
						birthday: null,
						street: null,
						zipCode: null,
						city: null,
						avatarId: null,
						avatarPlaceholder: createAvatarPlaceholder(),
					},
				})
				return query(args)
			},
		},
		member: {
			async create({ args, query }) {
				if (args.data.userId) {
					const userContact = await prisma.user.findUniqueOrThrow({
						where: { id: args.data.userId },
						select: userContactSelect,
					})
					args.data = { ...args.data, ...userContact }
				}
				return query(args)
			},
			async update({ args, query }) {
				const userId =
					typeof args.data.userId === 'object' ? args.data.userId?.set : args.data.userId
				if (userId) {
					const userContact = await prisma.user.findUniqueOrThrow({
						where: { id: userId },
						select: userContactSelect,
					})
					args.data = { ...args.data, ...userContact }
				}
				return query(args)
			},
		},
	},
})

async function eventDatesIncludePeriod(periodWhere: Prisma.PeriodWhereUniqueInput) {
	const [period, event] = await Promise.all([
		prisma.period.findUniqueOrThrow({ where: periodWhere }),
		prisma.period
			.findUniqueOrThrow({ where: periodWhere })
			.team()
			.event({ select: { id: true, startDate: true, endDate: true } }),
	])
	let data: Prisma.EventUpdateInput = {}
	if (!event.startDate || period.start < event.startDate) {
		data.startDate = period.start
	}
	if (!event.endDate || period.end > event.endDate) {
		data.endDate = period.end
	}
	await prisma.event.update({ where: { id: event.id }, data })
}

async function eventDatesRefresh(eventId: string) {
	const periods = await prisma.period.findMany({
		where: { team: { eventId } },
		select: { start: true, end: true },
	})
	let startDate: null | Date = null
	let endDate: null | Date = null
	if (periods.length) {
		startDate = new Date(Math.min(...periods.map((p) => p.start.getTime())))
		endDate = new Date(Math.max(...periods.map((p) => p.end.getTime())))
	}
	await prisma.event.update({
		where: { id: eventId },
		data: { startDate, endDate },
	})
}

const userContactSelect: Prisma.UserSelect = {
	email: true,
	isEmailVerified: true,
	phone: true,
	firstName: true,
	lastName: true,
	birthday: true,
	street: true,
	zipCode: true,
	city: true,
	avatarId: true,
	avatarPlaceholder: true,
}
