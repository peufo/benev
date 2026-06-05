import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import 'dayjs/locale/fr-ch'
import { getEventTimeZone } from './timezone'

dayjs.extend(relativeTime)
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.locale('fr-ch')

export default dayjs
export type { Dayjs } from 'dayjs'

export function daytz(...args: Parameters<typeof dayjs>) {
	return dayjs(...args).tz(getEventTimeZone())
}
