<script lang="ts">
	import { invalidateAll } from '$app/navigation'
	import { PlayIcon } from '@lucide/svelte'
	import { toast } from 'svelte-sonner'
	import dayjs from '$lib/dayjs'
	import { Surface } from '$lib/ui'
	import { runTask } from './tasks.remote'

	let { data } = $props()
	let running = $state<string>()

	async function run(name: string) {
		running = name
		try {
			const record = await runTask({ name })
			if (record.error) toast.error(record.error)
			else toast.success(`${name}: ${record.count} effet(s) en ${record.duration} ms`)
			await invalidateAll()
		} finally {
			running = undefined
		}
	}
</script>

<div class="max-w-4xl mx-auto">
	<Surface title="Tâches planifiées">
		<div class="overflow-x-auto">
			<table class="table">
				<thead>
					<tr>
						<th>Tâche</th>
						<th>Période</th>
						<th>Dernier passage</th>
						<th>Curseur</th>
						<th>Durée</th>
						<th>Effets</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					{#each data.tasks as task (task.name)}
						<tr>
							<td class="font-semibold">{task.name}</td>
							<td>{task.every / 1000} s</td>
							<td>
								{#if task.last}
									<span title={task.last.ranAt.toISOString()}
										>{dayjs(task.last.ranAt).fromNow()}</span
									>
									{#if task.last.error}
										<div class="text-error text-sm">{task.last.error}</div>
									{/if}
								{:else}
									<span class="opacity-60">jamais</span>
								{/if}
							</td>
							<td>{task.last ? dayjs(task.last.cursor).format('DD.MM.YYYY HH:mm:ss') : ''}</td>
							<td>{task.last ? `${task.last.duration} ms` : ''}</td>
							<td>{task.last?.count ?? ''}</td>
							<td class="text-right">
								<button
									type="button"
									class="btn btn-sm"
									disabled={running === task.name || task.running}
									onclick={() => run(task.name)}
								>
									<PlayIcon size={16} class="opacity-70" />
									Exécuter
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</Surface>
</div>
