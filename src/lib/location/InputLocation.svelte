<script lang="ts">
	import { Icon, InputRelation } from '$lib/fuma-legacy'
	import { mdiMapMarkerOutline } from '@mdi/js'

	type Suggestion = PrismaJson.Location & { id: string; title: string; detail: string }

	type PhotonFeature = {
		properties: {
			osm_id?: number
			osm_type?: string
			name?: string
			housenumber?: string
			street?: string
			postcode?: string
			city?: string
			country?: string
		}
		geometry: { coordinates: [number, number] }
	}

	interface Props {
		key?: string
		label?: string
		value?: PrismaJson.Location | null
		placeholder?: string
		/** Transféré à InputRelation; remplace `on:input`. */
		oninput?: (value: unknown) => void
	}

	let {
		key = 'location',
		label = 'Lieu',
		value = $bindable(null),
		placeholder = 'Commence à taper une adresse ou un lieu…',
		oninput,
	}: Props = $props()

	// InputRelation sérialise déjà un `{ id }` sous son propre `key`: on lui en donne
	// un distinct pour que notre champ caché reste seul à porter la valeur soumise
	const searchKey = $derived(`${key}_search`)

	const toSuggestion = ({ properties: p, geometry }: PhotonFeature): Suggestion => {
		const [lon, lat] = geometry.coordinates
		const street = [p.housenumber, p.street].filter(Boolean).join(' ')
		const city = [p.postcode, p.city].filter(Boolean).join(' ')
		// Photon renvoie souvent un `name` identique à la rue ou à la ville: on évite la répétition
		const title = p.name || street || p.city || ''
		const detail = [street, city, p.country].filter((part) => part && part !== title).join(', ')
		return {
			id: `${p.osm_type ?? ''}${p.osm_id ?? ''}-${lat},${lon}`,
			title,
			detail,
			label: [title, detail].filter(Boolean).join(', '),
			coords: { lat, lon },
		}
	}

	// Photon renvoie `Access-Control-Allow-Origin: *`, l'appel se fait donc
	// directement depuis le navigateur, sans endpoint proxy ni clé d'API
	async function search(q: string): Promise<Suggestion[]> {
		if (q.trim().length < 3) return []
		const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=6&lang=fr`
		const res = await fetch(url)
		if (!res.ok) throw new Error(`Photon a répondu ${res.status}`)
		const { features }: { features: PhotonFeature[] } = await res.json()
		// un même lieu existe souvent en plusieurs objets OSM (noeud, chemin, relation):
		// à libellé identique, on n'en garde qu'un
		// Aide locale de déduplication, jamais lue par le rendu: pas besoin de SvelteSet.
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const seen = new Set<string>()
		return features.map(toSuggestion).filter(({ label }) => {
			if (seen.has(label)) return false
			seen.add(label)
			return true
		})
	}

	// la valeur enregistrée n'a ni `title` ni `detail`: on la réhydrate pour l'affichage.
	// Un lieu hérité de l'ancien champ texte n'a pas de coordonnées.
	let selected: Suggestion | null = $state(
		value && {
			...value,
			id: value.label,
			title: value.label,
			detail: '',
		}
	)

	$effect.pre(() => {
		value = selected && {
			label: selected.label,
			...(selected.coords && { coords: selected.coords }),
		}
	})
</script>

<!-- La remote function reçoit du JSON en clair: `"null"` signifie « lieu effacé ». -->
<input type="hidden" name={key} value={JSON.stringify(value)} />

<InputRelation
	key={searchKey}
	{label}
	{search}
	{placeholder}
	bind:value={selected}
	classList="max-h-80 overflow-y-auto"
	{oninput}
>
	{#snippet suggestion({ item })}
		<div class="flex flex-col py-1">
			<span>{item.title}</span>
			{#if item.detail}
				<span class="text-sm opacity-60">{item.detail}</span>
			{/if}
		</div>
	{/snippet}

	{#snippet item({ item })}
		<div class="flex items-center gap-2">
			<Icon path={mdiMapMarkerOutline} class="opacity-70" />
			<span>{item?.label}</span>
		</div>
	{/snippet}
</InputRelation>
