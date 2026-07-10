import type { Member, Milestone, Period, Subscribe, Tag } from '@prisma/client'
import type { Dayjs } from 'dayjs'
import type { Day } from './getDays'

export type PeriodWithMembers = Period & {
	tags: Tag[]
	subscribes: (Subscribe & { member: Member })[]
}

export type Plan = {
	axis: 'x' | 'y'
	cursor: Dayjs
	hourSize: number
	start: Dayjs
	end: Dayjs
	days: Day[]
	length: number
	milestones: (Milestone & { time: Dayjs })[]
	milestonesInRange: (Milestone & { time: Dayjs })[]
}
