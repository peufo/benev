<script lang="ts">
	import { MapPinnedIcon } from '@lucide/svelte'
</script>

<!-- Rendu dans la colonne de droite, que le layout masque sous `md` tant qu'aucun secteur
     n'est choisi: sur mobile, la liste occupe seule l'écran. -->
<div class="surface grid place-content-center justify-items-center gap-3 p-10 text-center">
	<MapPinnedIcon size={32} class="opacity-40" />
	<p class="text-base-content/70">Sélectionne un secteur pour le consulter et l'éditer.</p>
</div>
