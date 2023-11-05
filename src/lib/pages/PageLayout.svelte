<script lang="ts">
	let klass = ''
	export { klass as class }
</script>

<div class="card bg-base-100 mx-auto prose p-6 shadow-md {klass}">
	<slot />
</div>
