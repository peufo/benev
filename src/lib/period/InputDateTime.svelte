<script lang="ts">
	import type { Dayjs } from '$lib/dayjs'
	import { MinusIcon, PlusIcon } from '@lucide/svelte'

	interface Props {
		label: string
		value: Dayjs
		key: string
		hint?: string
		onSetValue?: (newValue: Dayjs) => Dayjs
	}

	let { label, value = $bindable(), key, hint = '', onSetValue = (v) => v }: Props = $props()

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

<!-- La date part en ISO: c'est le schéma (`zDate`) qui la reconstruit côté serveur. -->
<input type="hidden" name={key} value={value.toJSON()} />

<fieldset class="fieldset">
	<label for="control-{key}" class="label">
		<span>{label}</span>
		{#if hint}
			<span class="ml-auto">
				{hint}
			</span>
		{/if}
	</label>
	<div>
		<input
			type="time"
			id="control-{key}"
			class="input"
			step={300}
			value={value.format('HH:mm')}
			oninput={(event) => setTime(event.currentTarget.value)}
		/>

		<div class="flex join w-full mt-1">
			<button
				type="button"
				class="btn btn-xs btn-square join-item bg-base-200/30"
				onclick={() => setValue(value.add(-1, 'day'))}
			>
				<MinusIcon size={12} />
			</button>
			<input
				type="date"
				class="input input-xs input-ghost join-item border-soft border-x-0"
				value={value.format('YYYY-MM-DD')}
				oninput={(event) => setDate(event.currentTarget.value)}
			/>
			<button
				type="button"
				class="btn btn-xs btn-square join-item bg-base-200/30"
				onclick={() => setValue(value.add(1, 'day'))}
			>
				<PlusIcon size={12} />
			</button>
		</div>
	</div>
</fieldset>
