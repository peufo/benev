<script lang="ts">
	import { Placeholder, Surface } from '#lib/ui/index.js'

	let { data } = $props()
</script>

<Surface back title="Importer depuis « {data.sourceEvent.name} »">
	<Placeholder>Le mappage des champs arrive bientôt.</Placeholder>
</Surface>
