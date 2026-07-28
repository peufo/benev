<script lang="ts">
	interface Props {
		value: number;
	}

	let { value }: Props = $props();
</script>

<td>
	<span class="badge">{value}</span>
</td>
