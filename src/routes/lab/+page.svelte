<script lang="ts">
	import { Card, Icon } from 'fuma'
	import { mdiMapMarkerOutline, mdiOpenInNew } from '@mdi/js'
	import { InputLocation, mapUrl } from '$lib/location'

	let location: PrismaJson.Location | null = null

	// alternatives à comparer avant de figer le format du lien
	const alternatives = ({ label, coords }: PrismaJson.Location) =>
		coords
			? [
					{
						name: 'OpenStreetMap',
						href: `https://www.openstreetmap.org/?mlat=${coords.lat}&mlon=${coords.lon}#map=18/${coords.lat}/${coords.lon}`,
					},
					{
						name: 'Apple Plans',
						href: `https://maps.apple.com/?ll=${coords.lat},${coords.lon}&q=${encodeURIComponent(
							label
						)}`,
					},
					{
						name: 'geo: (app native)',
						href: `geo:${coords.lat},${coords.lon}?q=${coords.lat},${
							coords.lon
						}(${encodeURIComponent(label)})`,
					},
			  ]
			: []
</script>

<div class="mx-auto flex max-w-2xl flex-col gap-4 p-4">
	<Card>
		<h2 slot="title">InputLocation (Photon / OpenStreetMap)</h2>

		<InputLocation bind:value={location} />

		<p class="mt-2 text-sm opacity-60">3 caractères minimum. Aucune clé d'API requise.</p>
	</Card>

	{#if location}
		<Card>
			<h2 slot="title">Affichage</h2>

			<div class="flex flex-col gap-4">
				<div>
					<div class="text-sm opacity-60">Rendu en pied de page</div>
					<a
						href={mapUrl(location)}
						target="_blank"
						rel="noopener noreferrer"
						class="btn btn-ghost btn-sm sm:btn-md"
					>
						<Icon path={mdiMapMarkerOutline} />
						<span>{location.label}</span>
					</a>
				</div>

				<div>
					<div class="text-sm opacity-60">Lien universel</div>
					<code class="text-xs break-all">{mapUrl(location)}</code>
				</div>

				<div>
					<div class="mb-1 text-sm opacity-60">Alternatives</div>
					<div class="flex flex-wrap gap-2">
						{#each alternatives(location) as { name, href } (name)}
							<a {href} target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-xs">
								<span>{name}</span>
								<Icon path={mdiOpenInNew} size={16} />
							</a>
						{/each}
					</div>
				</div>

				<div>
					<div class="mb-1 text-sm opacity-60">Valeur soumise (champ `location`)</div>
					<pre class="overflow-x-auto rounded bg-base-200 p-2 text-xs">{JSON.stringify(
							location,
							null,
							2
						)}</pre>
				</div>
			</div>
		</Card>
	{/if}
</div>
