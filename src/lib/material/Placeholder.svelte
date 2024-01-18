<script lang="ts">
	let klass = ''
	export { klass as class }
	export let style = ''
</script>

<div
	{style}
	class="rounded-box p-2 bg-base-200/40 h-32 grid place-content-center text-base-content/60 {klass}"
>
	<slot>Aucun élément</slot>
</div>
