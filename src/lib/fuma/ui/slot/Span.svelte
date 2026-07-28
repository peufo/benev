<script lang="ts">
	interface Props {
		content: string
	}

	let { content }: Props = $props()
</script>

<span>{content}</span>
