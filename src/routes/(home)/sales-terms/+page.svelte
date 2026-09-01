<script lang="ts">
	import { resolve } from '$app/paths'
	import { LegalPage, LEGAL_ENTITY } from '$lib/layout'
	import { EVENT_TIER, EVENT_TIER_SUPPORT } from '$lib/constant'

	const tiers = Object.values(EVENT_TIER)
</script>

<LegalPage title="Conditions de vente">
	<p>
		Ces conditions régissent l'achat d'un palier sur benevio. Elles complètent les
		<a href={resolve('/terms')}>conditions générales</a>, qui restent applicables.
	</p>

	<section>
		<h2>1. Ce qui est vendu</h2>
		<p>
			benevio est gratuit jusqu'à un certain nombre de bénévoles. Au-delà, l'organisateur·ice achète
			un palier, qui relève le quota de son évènement. <b
				>Aucune fonctionnalité n'est réservée aux paliers payants</b
			> : ils portent sur le volume de bénévoles, pas sur les fonctions.
		</p>
		<div class="overflow-x-auto">
			<table>
				<thead>
					<tr>
						<th>Palier</th>
						<th>Prix</th>
						<th>Quota</th>
					</tr>
				</thead>
				<tbody>
					{#each tiers as tier (tier.label)}
						<tr>
							<td>{tier.label}</td>
							<td>{tier.price}</td>
							<td>
								{tier.max === null ? 'Bénévoles illimités' : `Jusqu'à ${tier.max} bénévoles`}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<p>
			Le quota compte les <b>membres validés</b> de l'évènement, c'est-à-dire les bénévoles dont la participation
			a été acceptée par l'organisation. Les demandes en attente et les inscriptions déclinées n'y comptent
			pas. Le palier Pro fait l'objet d'un devis ; contacte-nous.
		</p>
	</section>

	<section>
		<h2>2. Achat unique, sans reconduction</h2>
		<p>
			Un palier s'achète <b>une seule fois, pour un seul évènement</b>. Ce n'est pas un abonnement :
			il n'y a <b>aucune reconduction, aucun prélèvement récurrent et aucune date d'expiration</b>.
			Le palier reste acquis à l'évènement aussi longtemps que celui-ci existe, sans nouveau
			paiement.
		</p>
		<p>Un palier acheté est rattaché définitivement à l'évènement sur lequel tu l'actives.</p>
		<ul>
			<li>
				Les évolutions possibles sont Basique vers Standard, Basique vers Premium, et Standard vers
				Premium.
			</li>
			<li>Le passage de Standard à Premium se fait au prix de la différence.</li>
			<li>
				Une rétrogradation vers un palier inférieur n'est pas possible, pas plus que la
				réutilisation d'un palier sur un second évènement ou son transfert à un tiers.
			</li>
		</ul>
		<p>
			Un palier acheté mais pas encore activé reste disponible dans ton espace personnel jusqu'à ce
			que tu l'attribues à un évènement.
		</p>
	</section>

	<section>
		<h2>3. Prix et paiement</h2>
		<p>
			Les prix sont indiqués en francs suisses (CHF). {LEGAL_ENTITY.name} n'est pas assujettie à la TVA
			: les montants affichés sont nets, aucune TVA n'est ajoutée ni facturée. Le prix applicable est
			celui affiché au moment de la commande. Un code promotionnel valide peut être saisi lors du paiement.
		</p>
		<p>
			Le paiement s'effectue par carte, via Stripe. <b
				>Aucune donnée de carte bancaire ne transite par benevio ni n'y est stockée.</b
			> Le palier est activé dès la confirmation du paiement.
		</p>
		<p>
			Tu reçois un email de confirmation, et l'ensemble de tes achats reste consultable dans ton
			espace personnel.
		</p>
	</section>

	<section>
		<h2>4. Droit de rétractation — 14 jours</h2>
		<p>
			Tu disposes de <b>14 jours à compter de l'achat</b> pour changer d'avis,
			<b>sans avoir à te justifier</b>, et obtenir le <b>remboursement intégral</b> — y compris si le
			palier a déjà été activé sur un évènement.
		</p>
		<p>
			Pour l'exercer, écris à {LEGAL_ENTITY.email} depuis l'adresse email de ton compte, en indiquant
			l'achat concerné. Le remboursement est effectué par Stripe sur le moyen de paiement d'origine, sous
			14 jours à compter de notre accusé de réception.
		</p>
		<p>
			À la suite du remboursement, l'évènement revient au palier Basique et son quota gratuit
			s'applique de nouveau. Si le nombre de bénévoles validés dépasse alors ce quota, les
			conséquences décrites au point 5 s'appliquent.
		</p>
	</section>

	<section>
		<h2>5. Dépassement du quota</h2>
		<p>Quand un évènement dépasse le quota de son palier :</p>
		<ul>
			<li>les bénévoles peuvent continuer à s'inscrire et à consulter leurs créneaux ;</li>
			<li>l'accès à l'espace d'administration de l'évènement est restreint.</li>
		</ul>
		<p>
			Aucune donnée n'est supprimée et aucun bénévole n'est bloqué. Le propriétaire de l'évènement
			est prévenu par email à 80 %, 90 % et 100 % du quota, afin de ne pas être pris de court. Le
			passage à un palier supérieur rétablit immédiatement l'accès.
		</p>
	</section>

	<section>
		<h2>6. Support</h2>
		<p>
			Le support se fait par email. Les délais annoncés sont des <b
				>objectifs indicatifs, et non des délais garantis</b
			> :
		</p>
		<ul>
			<li>{EVENT_TIER_SUPPORT.standard} ;</li>
			<li>{EVENT_TIER_SUPPORT.premium} ;</li>
			<li>{EVENT_TIER_SUPPORT.pro}.</li>
		</ul>
		<p>
			Le support couvre l'utilisation du service hébergé sur benev.io. Il ne couvre pas les
			instances que tu héberges toi-même à partir du code source.
		</p>
	</section>

	<section>
		<h2>7. Disponibilité et force majeure</h2>
		<p>
			Nous ne garantissons pas une disponibilité continue du service. Aucune des parties n'est
			responsable d'un manquement dû à un cas de force majeure : panne majeure d'un fournisseur,
			interruption d'accès aux réseaux, catastrophe naturelle, décision d'autorité.
		</p>
	</section>

	<section>
		<h2>8. Responsabilité</h2>
		<p>
			Notre responsabilité en lien avec un achat est plafonnée au montant payé pour l'évènement
			concerné. Les limites et les réserves énoncées à l'article 9 des
			<a href={resolve('/terms')}>conditions générales</a> s'appliquent, en particulier celle relative
			à la faute intentionnelle et à la négligence grave, qui ne peuvent pas être exclues.
		</p>
	</section>

	<section>
		<h2>9. Droit applicable et for</h2>
		<p>
			Droit suisse, for au siège de Dev Voisard, sous réserve d'un for impératif prévu par la loi,
			notamment en faveur des consommateurs.
		</p>
	</section>
</LegalPage>
