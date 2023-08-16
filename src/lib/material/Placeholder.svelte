<script lang="ts">
	let klass = ''
	export { klass as class }
</script>

<div class="rounded-box bg-base-200/40 h-60 grid place-content-center text-base-content/60 {klass}">
	<slot />
</div>
