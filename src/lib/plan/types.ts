import type { Member, Period, Subscribe } from '@prisma/client'

export type PeriodWithSubscribesUserName = Period & {
	subscribes: (Subscribe & { member: Member & { user: { firstName: string; lastName: string } } })[]
}
