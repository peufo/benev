<script lang="ts">
	import manifest from '#lib/landing/videos.json'

	interface Props {
		/** Un id absent du manifeste ne compile pas: la vidéo doit être publiée avant d'être citée. */
		id: keyof typeof manifest
		title: string
	}

	let { id, title }: Props = $props()

	const { video, poster } = $derived(manifest[id])
</script>

<!-- Pas de lecture automatique: dans une page qu'on lit, c'est le lecteur qui décide quand
     regarder. `preload="metadata"` pour la même raison que `VideoCarousel`: Safari télécharge
     sinon chaque vidéo en entier dès l'ouverture de la page. -->
<figure class="not-prose space-y-2">
	<video
		src={video}
		{poster}
		controls
		muted
		playsinline
		preload="metadata"
		class="border-soft aspect-[1.6] w-full rounded-field border"
	></video>
	<figcaption class="text-base-content/70 text-sm">{title}</figcaption>
</figure>
