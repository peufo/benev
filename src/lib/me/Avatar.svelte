<script lang="ts">
	export let avatarId: string | null
	export let avatarPlaceholder: string
	export let firstName: string
	let klass = ''
	export { klass as class }
	export let size: 'medium' | 'large' = 'medium'
</script>

{#key avatarId || avatarPlaceholder}
	<img
		src={avatarId ? `/media/${avatarId}?size=${size}` : avatarPlaceholder}
		alt="Avatar de {firstName}"
		class={klass}
		style="margin: 0 !important;"
	/>
{/key}
