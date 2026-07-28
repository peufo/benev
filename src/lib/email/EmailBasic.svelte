<script lang="ts">
	import EmailLayout from './EmailLayout.svelte'
	interface Props {
		title?: string
		subtitle?: string
		content?: string
	}

	let { title = '', subtitle = '', content = '' }: Props = $props()
</script>

<EmailLayout {title} {subtitle}>
	<!-- `content` est du HTML d'email construit côté serveur à partir des modèles
	     tiptap, jamais une saisie visiteur -->
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html content}
</EmailLayout>
