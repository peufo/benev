<script lang="ts">
	import InputCheckboxsTreeNodes, {
		type Options,
	} from '$lib/material/input/InputCheckboxsTreeNodes.svelte'
	export let label: string
	export let options: Options
	let klass = ''
	export { klass as class }
</script>

<div class={klass}>
	<div class="label">
		<span class="label-text">{label}</span>
		<slot name="label_append" />
	</div>
	<InputCheckboxsTreeNodes {options} />
</div>
