<script lang="ts">
	import { type Dayjs } from '$lib/dayjs'
	import { USE_COERCE_DATE } from 'fuma'

	export let label: string
	export let value: Dayjs
	export let key: string
	export let hint = ''
	export let onSetValue: (newValue: Dayjs) => Dayjs = (v) => v

	function setDateTime(datetime: string) {
		if (!datetime) return
		const [date, time] = datetime.split('T')
		const [y, M, d] = date.split('-').map(Number)
		const [h, m] = time.split(':').map(Number)
		setValue(
			value
				.set('y', y)
				.set('M', M - 1)
				.set('D', d)
				.set('h', h)
				.set('m', m)
				.set('s', 0)
				.set('ms', 0)
		)
	}

	function setValue(newValue: Dayjs) {
		value = onSetValue(newValue)
	}
</script>

<input type="hidden" name={key} value="{USE_COERCE_DATE}{value.toJSON()}" />

<div class="form-control">
	<label for="control-{key}" class="label">
		<span class="label-text">{label}</span>
		{#if hint}
			<span class="label-text-alt">
				{hint}
			</span>
		{/if}
	</label>
	<input
		type="datetime-local"
		id="control-{key}"
		class="input input-bordered"
		step={300}
		value={value.format('YYYY-MM-DDTHH:mm')}
		on:input={(event) => setDateTime(event.currentTarget.value)}
	/>
</div>
