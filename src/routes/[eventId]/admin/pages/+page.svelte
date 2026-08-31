<script lang="ts">
	import { FileTextIcon } from '@lucide/svelte'
</script>

<!-- Rendu dans la colonne de droite, que le layout masque sous `md` tant qu'aucune publication
     n'est choisie: sur mobile, la liste occupe seule l'écran. -->
<div class="surface grid place-content-center justify-items-center gap-3 p-10 text-center">
	<FileTextIcon size={32} class="opacity-40" />
	<p class="text-base-content/70">Sélectionne une publication pour la rédiger.</p>
</div>
