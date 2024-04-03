<script lang="ts">
	export let value: (string | number | boolean)[]
</script>

<td>
	{#each value as v}
		<span class="badge mr-1 whitespace-nowrap">
			{v}
		</span>
	{/each}
</td>
