import { ctrl } from '$lib/store'
import { derived } from 'svelte/store'
import { time } from './utils'

export const magnet = derived(
	ctrl,
	(isCtrl) => (ms: number) => time(ms).roundBy(isCtrl ? 1 : 15, 'minute')
)
