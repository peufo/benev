<script lang="ts">
	import { Badge } from '$lib/ui/badge/index.js'
	import { component, type ComponentAndProps } from '$lib/ui/component.js'

	interface Props {
		value: (ComponentAndProps | string | number | boolean)[]
	}

	let { value }: Props = $props()
</script>

<td>
	{#each value as v}
		{@const componentAndProps =
			typeof v === 'object' ? v : component(Badge, { content: String(v) })}
		<componentAndProps.component {...componentAndProps.props} />
	{/each}
</td>
