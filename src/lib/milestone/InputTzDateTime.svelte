<script lang="ts">
	import { type Dayjs } from '$lib/dayjs'

	interface Props {
		label: string
		value: Dayjs
		key: string
		hint?: string
		onSetValue?: (newValue: Dayjs) => Dayjs
	}

	let { label, value = $bindable(), key, hint = '', onSetValue = (v) => v }: Props = $props()

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
				.startOf('m')
		)
	}

	function setValue(newValue: Dayjs) {
		value = onSetValue(newValue)
	}
</script>

<!-- La date part en ISO: c'est le schéma (`zDate`) qui la reconstruit côté serveur. -->
<input type="hidden" name={key} value={value.toJSON()} />

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
		class="input"
		step={300}
		value={value.format('YYYY-MM-DDTHH:mm')}
		oninput={(event) => setDateTime(event.currentTarget.value)}
	/>
</div>
