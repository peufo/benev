import { afterEach, beforeEach, describe, it, vi } from 'vitest'
import { createScheduler, type TaskRunRecord, type TaskStore } from '$lib/server/scheduler'

/**
 * Le ticker seul, aux faux timers et sur un store en mémoire: ce qui compte est la fenêtre que
 * chaque passage transmet à sa tâche, et ce qui en reste après un échec ou un arrêt.
 */

function memoryStore(initial: Record<string, TaskRunRecord> = {}): TaskStore & {
	runs: Record<string, TaskRunRecord>
} {
	const runs = { ...initial }
	return {
		runs,
		load: async (name) => runs[name] ?? null,
		save: async (name, run) => {
			runs[name] = run
		},
	}
}

/** Vide la file des microtâches: les passages sont async, les faux timers ne les attendent pas. */
const settle = () => vi.advanceTimersByTimeAsync(0)

describe('scheduler', () => {
	beforeEach(() => {
		vi.useFakeTimers()
		vi.setSystemTime(new Date('2026-09-19T10:00:00Z'))
	})
	afterEach(() => {
		vi.useRealTimers()
	})

	it('pose le curseur sans rejouer le passé au premier passage', async ({ expect }) => {
		const windows: { since: Date; until: Date }[] = []
		const run = vi.fn(async (window: { since: Date; until: Date }) => {
			windows.push(window)
			return 0
		})
		const store = memoryStore()
		const scheduler = createScheduler([{ name: 't', every: 60_000, run }], store)
		scheduler.start()
		await settle()

		expect(windows).toHaveLength(1)
		expect(windows[0].since.getTime()).toBe(windows[0].until.getTime())
		expect(store.runs.t.cursor.toISOString()).toBe('2026-09-19T10:00:00.000Z')
		await scheduler.stop()
	})

	it('enchaîne des fenêtres contiguës à partir du curseur enregistré', async ({ expect }) => {
		const windows: string[] = []
		const run = vi.fn(async ({ since, until }: { since: Date; until: Date }) => {
			windows.push(`${since.toISOString()}..${until.toISOString()}`)
			return 1
		})
		const cursor = new Date('2026-09-19T09:58:00Z')
		const store = memoryStore({
			t: { cursor, ranAt: cursor, duration: 0, count: 0, error: null },
		})
		const scheduler = createScheduler([{ name: 't', every: 60_000, run }], store, {
			tick: 60_000,
		})
		scheduler.start()
		await settle()
		await vi.advanceTimersByTimeAsync(60_000)

		expect(windows).toEqual([
			'2026-09-19T09:58:00.000Z..2026-09-19T10:00:00.000Z',
			'2026-09-19T10:00:00.000Z..2026-09-19T10:01:00.000Z',
		])
		expect(store.runs.t.count).toBe(1)
		await scheduler.stop()
	})

	it("respecte l'échéance de chaque tâche", async ({ expect }) => {
		const fast = vi.fn(async () => 0)
		const slow = vi.fn(async () => 0)
		const scheduler = createScheduler(
			[
				{ name: 'fast', every: 10_000, run: fast },
				{ name: 'slow', every: 300_000, run: slow },
			],
			memoryStore(),
			{ tick: 10_000 }
		)
		scheduler.start()
		await vi.advanceTimersByTimeAsync(60_000)

		expect(fast).toHaveBeenCalledTimes(7)
		expect(slow).toHaveBeenCalledTimes(1)
		await scheduler.stop()
	})

	it('ne relance pas une tâche encore en cours', async ({ expect }) => {
		let release!: () => void
		const run = vi.fn(() => new Promise<number>((resolve) => (release = () => resolve(0))))
		const scheduler = createScheduler([{ name: 't', every: 0, run }], memoryStore(), {
			tick: 1_000,
		})
		scheduler.start()
		await vi.advanceTimersByTimeAsync(5_000)
		expect(run).toHaveBeenCalledOnce()
		expect(scheduler.status()[0].running).toBe(true)

		release()
		await settle()
		expect(scheduler.status()[0].running).toBe(false)
		await scheduler.stop()
	})

	it("garde l'ancien curseur quand la tâche échoue, et le rejoue ensuite", async ({ expect }) => {
		const cursor = new Date('2026-09-19T09:00:00Z')
		const store = memoryStore({
			t: { cursor, ranAt: cursor, duration: 0, count: 0, error: null },
		})
		let fail = true
		const run = vi.fn(async ({ since }: { since: Date }) => {
			if (fail) throw new Error('base injoignable')
			return since.getTime() === cursor.getTime() ? 1 : 0
		})
		const scheduler = createScheduler([{ name: 't', every: 60_000, run }], store, {
			tick: 60_000,
		})
		const silence = vi.spyOn(console, 'error').mockImplementation(() => {})
		scheduler.start()
		await settle()
		expect(store.runs.t.error).toBe('base injoignable')
		expect(store.runs.t.cursor).toEqual(cursor)

		fail = false
		await vi.advanceTimersByTimeAsync(60_000)
		expect(store.runs.t.error).toBeNull()
		expect(store.runs.t.count).toBe(1)
		silence.mockRestore()
		await scheduler.stop()
	})

	it('attend la tâche en cours à l’arrêt, sans dépasser la garde', async ({ expect }) => {
		let release!: () => void
		const run = vi.fn(() => new Promise<number>((resolve) => (release = () => resolve(0))))
		const scheduler = createScheduler([{ name: 't', every: 0, run }], memoryStore())
		scheduler.start()
		await settle()

		let stopped = false
		const stopping = scheduler.stop({ timeout: 5_000 }).then(() => (stopped = true))
		await vi.advanceTimersByTimeAsync(1_000)
		expect(stopped).toBe(false)
		release()
		await settle()
		await stopping
		expect(stopped).toBe(true)

		const hanging = createScheduler(
			[{ name: 'h', every: 0, run: () => new Promise<number>(() => {}) }],
			memoryStore()
		)
		hanging.start()
		await settle()
		let guarded = false
		const guard = hanging.stop({ timeout: 5_000 }).then(() => (guarded = true))
		await vi.advanceTimersByTimeAsync(5_000)
		await guard
		expect(guarded).toBe(true)
	})

	it("`runNow` ignore l'échéance et rend le passage", async ({ expect }) => {
		const run = vi.fn(async () => 3)
		const scheduler = createScheduler([{ name: 't', every: 3_600_000, run }], memoryStore())
		scheduler.start()
		await settle()
		const record = await scheduler.runNow('t')
		expect(run).toHaveBeenCalledTimes(2)
		expect(record.count).toBe(3)
		expect(() => scheduler.runNow('inconnue')).toThrow()
		await scheduler.stop()
	})
})
