<script lang="ts">
	
	interface Props {
		class?: string;
		content: string;
	}

	let { class: klass = '', content }: Props = $props();
</script>

<span class="badge mr-1 whitespace-nowrap {klass}">
	{content}
</span>
