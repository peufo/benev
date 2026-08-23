<script lang="ts">
	import { resolve } from '$app/paths'
	import { LegalPage, LEGAL_ENTITY } from '$lib/layout'
</script>

<LegalPage title="Mentions légales">
	<section>
		<h2>Éditeur du service</h2>
		<p>
			<b>{LEGAL_ENTITY.name}</b><br />
			Raison individuelle inscrite en Suisse<br />
			IDE {LEGAL_ENTITY.ide}<br />
			{LEGAL_ENTITY.street}<br />
			{LEGAL_ENTITY.locality}, {LEGAL_ENTITY.country}
		</p>
		<p>
			Responsable de la publication : Jonas Voisard.<br />
			{LEGAL_ENTITY.name} n'est pas assujettie à la TVA : aucune TVA n'est facturée ni due sur les prestations
			de benevio.
		</p>
	</section>

	<section>
		<h2>Contact</h2>
		<p>
			Par email à {LEGAL_ENTITY.email}, ou via le
			<a href={resolve('/contact')}>formulaire de contact</a>, accessible sans compte.
		</p>
		<p>
			Pour les demandes relatives aux données personnelles, la marche à suivre est détaillée dans la
			<a href={resolve('/privacy')}>politique de confidentialité</a>.
		</p>
	</section>

	<section>
		<h2>Hébergement</h2>
		<p>
			L'application, la base de données, les images et le service d'envoi d'emails sont hébergés par <b
				>Hostinger International Ltd</b
			>, société établie en Lituanie, sur des serveurs situés en <b>Allemagne</b>.
		</p>
		<p>
			Les paiements sont opérés par <b>Stripe Payments Europe Ltd</b>, établie en Irlande. Aucune
			donnée de carte bancaire ne transite par benevio.
		</p>
	</section>

	<section>
		<h2>Propriété intellectuelle</h2>
		<p>
			Le code source de benevio est publié sous licence
			<a href="https://github.com/peufo/benev/blob/main/LICENSE" target="_blank" rel="noreferrer">
				AGPL-3.0
			</a>
			sur
			<a href="https://github.com/peufo/benev" target="_blank" rel="noreferrer">
				github.com/peufo/benev
			</a>.
		</p>
		<p>
			Cette licence porte sur le code, et sur lui seul. Elle ne concède aucun droit sur la marque et
			le nom « benevio », sur le logo et les éléments graphiques de la marque, sur le nom de domaine
			benev.io, ni sur les données hébergées par le service. Ces éléments restent la propriété
			exclusive de Dev Voisard.
		</p>
		<p>
			Les contenus publiés par les organisateurs et les bénévoles — textes, images, affiches, logos
			d'évènement — restent la propriété de leurs auteurs.
		</p>
	</section>

	<section>
		<h2>Signaler un contenu</h2>
		<p>
			Un contenu publié sur benevio te paraît illicite ou porte atteinte à tes droits ? Signale-le à {LEGAL_ENTITY.email}
			en indiquant l'adresse de la page concernée et le motif. Nous examinons chaque signalement et retirons
			sans préavis les contenus manifestement illicites.
		</p>
	</section>
</LegalPage>
