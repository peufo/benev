<script lang="ts">
	import EmailLayout from './EmailLayout.svelte'
	export let title = ''
	export let subtitle = ''
	export let content = ''
</script>

<EmailLayout {title} {subtitle}>
	{@html content}
</EmailLayout>
