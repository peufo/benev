<script lang="ts">
	interface Props {
		avatarId: string | null
		avatarPlaceholder: string
		firstName: string
		class?: string
		size?: 'medium' | 'large'
	}

	let {
		avatarId,
		avatarPlaceholder,
		firstName,
		class: klass = '',
		size = 'medium',
	}: Props = $props()
</script>

{#key avatarId || avatarPlaceholder}
	<img
		src={avatarId ? `/media/${avatarId}?size=${size}` : avatarPlaceholder}
		alt="Avatar de {firstName}"
		class={klass}
		style="margin: 0 !important;"
	/>
{/key}
