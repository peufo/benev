<script lang="ts">
import PeriodForm from './PeriodForm.svelte'

	export let data

	const formater = new Intl.DateTimeFormat('fr-ch', {
		weekday: 'long',
		day: 'numeric',
		month: 'numeric',
		year: 'numeric',
		hour: 'numeric',
		minute: 'numeric',
	})

	let subscribeDialog: HTMLDialogElement
	let selectedPeriodLabel: string | undefined = undefined


</script>

<div class="p-4 card bg-base-100 max-w-4xl m-auto">
	<div class="flex gap-2 py-2 items-center">
		<div>
			<h2 class="text-2xl">{data.team.name}</h2>
			<p>{data.team.description || ''}</p>
		</div>
		<div class="grow" />
	</div>
	<hr />

	<table class="table">
		<thead>
			<tr>
				<th>Période de travail</th>
				<th>Bénévoles</th>
			</tr>
		</thead>

		<tbody>
			{#each data.periods as period}
				{@const periodLabel = formater.formatRange(period.start, period.end)}
				<tr
					class="hover cursor-pointer relative"
					on:click={() => {
						selectedPeriodLabel = periodLabel
						subscribeDialog.showModal()
					}}
				>
					<td>{periodLabel}</td>
					<td class="flex gap-2 items-center">
						<progress class="progress" value={1} max={period.maxSubscribe} />
						<span class="whitespace-nowrap">1 / {period.maxSubscribe}</span>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

{#if data.isLeader}
	<div class="max-w-md m-auto mt-4 bg-base-100 rounded-lg">
		<PeriodForm />
	</div>
{/if}

<dialog class="modal" bind:this={subscribeDialog}>
	<form action="new_subscribe" method="post" class="modal-box flex flex-col gap-4">
		<h2 class="text-2xl">{data.team.name}</h2>

		<p class="text-lg">Souhaites-tu t'inscrire à la période de travail suivante ?</p>
		<p class="text-lg">{selectedPeriodLabel}</p>

		<div class="flex gap-2 justify-end">
			<button class="btn btn-ghost" on:click|preventDefault={() => subscribeDialog.close()}>
				Non
			</button>

			<button class="btn">Oui je le veux !</button>
		</div>
	</form>
</dialog>
