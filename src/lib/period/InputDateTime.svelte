<script lang="ts">
	import type { Dayjs } from '$lib/dayjs'
	import { USE_COERCE_DATE } from 'fuma'

	export let label: string
	export let value: Dayjs
	export let name: string
	export let hint = ''
	export let onSetValue: (newValue: Dayjs) => Dayjs = (v) => v

	function setTime(time: string) {
		if (!time) return
		const [h, m] = time.split(':').map(Number)
		setValue(value.set('h', h).set('m', m))
	}

	function setDate(date: string) {
		if (!date) return
		const [y, m, d] = date.split('-').map(Number)
		setValue(
			value
				.set('y', y)
				.set('M', m - 1)
				.set('D', d)
		)
	}

	function setValue(newValue: Dayjs) {
		value = onSetValue(newValue)
	}
</script>

<input type="hidden" {name} value="{USE_COERCE_DATE}{value.toJSON()}" />

<div class="form-control">
	<label for="control-{name}" class="label">
		<span class="label-text">{label}</span>
		{#if hint}
			<span class="label-text-alt">
				{hint}
			</span>
		{/if}
	</label>
	<input
		type="time"
		id="control-{name}"
		class="input input-bordered"
		step={300}
		value={value.format('HH:mm')}
		on:input={(event) => setTime(event.currentTarget.value)}
	/>

	<div class="flex pt-1 join">
		<button
			type="button"
			class="btn btn-xs join-item bg-base-200/30"
			on:click={() => setValue(value.add(-1, 'day'))}
		>
			<span>-</span>
		</button>
		<input
			type="date"
			class="input input-xs input-bordered input-ghost join-item max-w-[110px]"
			value={value.format('YYYY-MM-DD')}
			on:input={(event) => setDate(event.currentTarget.value)}
		/>
		<button
			type="button"
			class="btn btn-xs join-item bg-base-200/30"
			on:click={() => setValue(value.add(1, 'day'))}
		>
			<span>+</span>
		</button>
	</div>
</div>
