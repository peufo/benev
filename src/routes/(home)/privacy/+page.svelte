<script lang="ts">
	import { resolve } from '$app/paths'
	import { LegalPage, LEGAL_ENTITY } from '$lib/layout'
</script>

<LegalPage title="Confidentialité">
	<p>
		Cette politique explique quelles données benevio collecte, pourquoi, qui y a accès et combien de
		temps elles sont conservées. Elle fait partie intégrante des
		<a href={resolve('/terms')}>conditions générales</a>.
	</p>
	<p>
		benevio est un service suisse. Cette politique applique la loi fédérale sur la protection des
		données (LPD) et, lorsqu'il s'applique, le règlement général sur la protection des données
		(RGPD).
	</p>

	<section>
		<h2>1. Qui est responsable de quoi</h2>
		<p>Deux situations se superposent dans benevio, et elles n'ont pas le même responsable.</p>
		<ul>
			<li>
				<b>Ton compte</b> — email, nom, coordonnées, mot de passe, préférences, achats, messages de
				support. benevio en est <b>responsable du traitement</b> : c'est nous qui décidons pourquoi ces
				données existent.
			</li>
			<li>
				<b>Ta participation à un évènement</b> — inscriptions, équipes, réponses aux champs
				personnalisés, présence. L'<b>organisateur de cet évènement</b> en est responsable du
				traitement : c'est lui qui décide ce qu'il demande et pourquoi. Nous agissons pour son
				compte, comme <b>sous-traitant</b>.
			</li>
		</ul>
		<p>
			Concrètement : pour une question sur ton compte, écris-nous. Pour une question sur ce qu'un
			évènement sait de toi, l'organisateur est le premier interlocuteur — mais écris-nous quand
			même si tu n'obtiens pas de réponse.
		</p>
		<p>Comme sous-traitant d'un organisateur, nous nous engageons à :</p>
		<ul>
			<li>
				ne traiter les données que sur ses instructions et pour les finalités de son évènement ;
			</li>
			<li>soumettre à la confidentialité toute personne ayant accès à ces données ;</li>
			<li>appliquer les mesures de sécurité décrites au point 10 ;</li>
			<li>
				ne recourir qu'aux sous-traitants ultérieurs listés au point 5, et informer l'organisateur
				de tout changement afin qu'il puisse s'y opposer ;
			</li>
			<li>
				l'assister pour répondre aux demandes des personnes concernées et en cas de violation de
				données ;
			</li>
			<li>
				lui restituer ou supprimer les données à la fin de la prestation, sous réserve des durées de
				conservation légales.
			</li>
		</ul>
	</section>

	<section>
		<h2>2. Quelles données nous traitons</h2>
		<ul>
			<li>
				<b>Compte</b> — adresse email, prénom, nom, téléphone, date de naissance, rue, code postal, localité,
				photo de profil. Le mot de passe est haché : il n'est jamais stocké en clair.
			</li>
			<li>
				<b>Connexion Google ou GitHub</b>, si tu choisis ce mode — adresse email, nom et photo de
				profil transmis par le fournisseur.
			</li>
			<li>
				<b>Participation</b> — rôle, équipes, réponses aux champs personnalisés définis par
				l'organisateur, inscriptions aux créneaux et leur état, présence ou absence constatée,
				dotations attribuées. Les données de ton compte sont <b>recopiées sur ta fiche de membre</b>
				dans chaque évènement où tu participes, pour que l'organisateur dispose d'informations à jour.
			</li>
			<li>
				<b>Achats</b> — montant, devise, date, identifiant de la session de paiement, palier acheté
				et évènement associé. <b>Aucune donnée de carte bancaire</b> ne transite par benevio ni n'y est
				stockée.
			</li>
			<li><b>Support</b> — sujet, contenu et date de tes messages.</li>
			<li>
				<b>Contenus</b> — ce que tu publies : pages, textes, images, affiches, logos, charte des bénévoles,
				modèles d'email.
			</li>
			<li>
				<b>Techniques</b> — cookie de session et journaux serveur (adresse IP, horodatage, page demandée),
				pour la sécurité et le diagnostic.
			</li>
		</ul>
	</section>

	<section>
		<h2>3. Pourquoi, et sur quelle base</h2>
		<div class="overflow-x-auto">
			<table>
				<thead>
					<tr>
						<th>Finalité</th>
						<th>Base légale</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>Fournir le service et gérer ton compte</td>
						<td>Exécution du contrat</td>
					</tr>
					<tr>
						<td>Organiser un évènement et ses équipes</td>
						<td>Contrat, intérêt légitime ou consentement, selon ce que demande l'organisateur</td>
					</tr>
					<tr>
						<td>Envoyer les emails liés à ton activité (inscription, validation, alertes)</td>
						<td>Exécution du contrat</td>
					</tr>
					<tr>
						<td>Encaisser un paiement et tenir la comptabilité</td>
						<td>Exécution du contrat, obligation légale</td>
					</tr>
					<tr>
						<td>Répondre à tes messages de support</td>
						<td>Exécution du contrat, intérêt légitime</td>
					</tr>
					<tr>
						<td>Sécuriser le service et diagnostiquer les incidents</td>
						<td>Intérêt légitime</td>
					</tr>
				</tbody>
			</table>
		</div>
		<p>
			Nous ne faisons <b>ni publicité, ni profilage, ni revente de données</b>. Aucune de ces
			finalités n'existe dans benevio et aucune n'est prévue.
		</p>
	</section>

	<section>
		<h2>4. Qui y a accès</h2>
		<ul>
			<li>Toi, sur ton profil.</li>
			<li>
				Les organisateurs et responsables des évènements où ta participation est validée. Un
				responsable voit les informations des bénévoles de son équipe, <b
					>y compris les réponses aux champs personnalisés que l'organisateur a choisi de ne pas te
					rendre visibles</b
				>.
			</li>
			<li>
				L'exploitant du service, pour le support technique, la modération et la maintenance, dans la
				stricte mesure nécessaire.
			</li>
		</ul>
		<p>
			<b>Une exception à connaître.</b> Les images — avatars, affiches, logos, fonds de badge — sont servies
			sans authentification. Leur adresse n'est ni devinable, ni listée, ni indexée, mais toute personne
			qui en dispose peut afficher l'image.
		</p>
		<p>
			<b>Exports.</b> Les organisateurs et responsables peuvent exporter la liste des membres (CSV, vCard)
			et les plannings (iCal). Ces fichiers quittent benevio : leur usage relève de l'organisateur. Un
			organisateur peut également importer des membres d'un de ses évènements vers un autre.
		</p>
	</section>

	<section>
		<h2>5. À qui nous confions des données</h2>
		<div class="overflow-x-auto">
			<table>
				<thead>
					<tr>
						<th>Prestataire</th>
						<th>Rôle</th>
						<th>Données</th>
						<th>Lieu</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>Hostinger International Ltd</td>
						<td
							>Hébergement de l'application, de la base de données, des images et envoi des emails</td
						>
						<td>Toutes</td>
						<td>Serveurs en Allemagne, société établie en Lituanie</td>
					</tr>
					<tr>
						<td>Stripe Payments Europe Ltd</td>
						<td>Paiement par carte</td>
						<td>Nom, email, téléphone, montant</td>
						<td>Irlande, États-Unis</td>
					</tr>
					<tr>
						<td>Google, GitHub</td>
						<td>Connexion, uniquement si tu choisis ce mode</td>
						<td>Email, nom, photo de profil</td>
						<td>États-Unis</td>
					</tr>
					<tr>
						<td>Komoot (Photon)</td>
						<td>Autocomplétion d'adresse, appelée depuis ton navigateur</td>
						<td>Adresse IP, texte saisi</td>
						<td>Allemagne</td>
					</tr>
					<tr>
						<td>Google Fonts</td>
						<td>Police de caractères, appelée depuis ton navigateur</td>
						<td>Adresse IP</td>
						<td>États-Unis</td>
					</tr>
					<tr>
						<td>DiceBear</td>
						<td>Avatar par défaut, appelé depuis ton navigateur</td>
						<td>Adresse IP</td>
						<td>États-Unis</td>
					</tr>
				</tbody>
			</table>
		</div>
		<p>
			Les trois derniers sont appelés <b>directement par ton navigateur</b> lorsque tu consultes une page
			: ils reçoivent donc ton adresse IP, sans que ces données transitent par nos serveurs.
		</p>
	</section>

	<section>
		<h2>6. Cookies</h2>
		<p>benevio pose trois cookies, tous strictement nécessaires :</p>
		<ul>
			<li>un cookie de session, pour te garder connecté ;</li>
			<li>
				deux cookies techniques de courte durée, uniquement si tu passes par la connexion Google ou
				GitHub.
			</li>
		</ul>
		<p>
			Aucun cookie publicitaire, aucun traceur, aucune mesure d'audience, aucun bouton de réseau
			social. Il n'y a pas de bannière de cookies parce qu'il n'y a rien à te faire accepter.
		</p>
	</section>

	<section>
		<h2>7. Combien de temps nous conservons les données</h2>
		<ul>
			<li><b>Ton compte</b> — tant qu'il existe.</li>
			<li>
				<b>Tes fiches de membre après suppression du compte</b> — conservées anonymisées, sans donnée
				personnelle, pour préserver l'historique de l'évènement.
			</li>
			<li>
				<b>Un évènement supprimé par son organisateur</b> — conservé <b>12 mois</b>, puis effacé
				définitivement.
			</li>
			<li>
				<b>Achats et pièces comptables</b> — <b>10 ans</b>, en application de l'obligation légale de
				conservation (art. 958f CO).
			</li>
			<li><b>Messages de support</b> — 3 ans.</li>
			<li><b>Journaux serveur</b> — 12 mois.</li>
		</ul>
	</section>

	<section>
		<h2>8. Tes droits</h2>
		<p>
			Tu peux demander l'accès à tes données, leur rectification, leur effacement, la limitation ou
			l'opposition à leur traitement, leur portabilité, et retirer un consentement que tu as donné.
		</p>
		<p>
			<b>Comment</b> — écris à {LEGAL_ENTITY.email} ou passe par le
			<a href={resolve('/contact')}>formulaire de contact</a>, qui est accessible
			<b>sans compte</b>. Nous répondons dans les 30 jours. Nous pouvons te demander de justifier
			ton identité avant de transmettre des données personnelles.
		</p>
		<p>
			Pour les données rattachées à un évènement, l'organisateur est le responsable du traitement :
			adresse-toi d'abord à lui. Si tu n'obtiens pas de réponse, écris-nous et nous ferons le
			nécessaire.
		</p>
		<p>
			<b>Recours</b> — tu peux saisir le Préposé fédéral à la protection des données et à la transparence
			(PFPDT) en Suisse, ou l'autorité de contrôle de ton pays de résidence dans l'Union européenne.
		</p>
	</section>

	<section>
		<h2>9. Ce que la suppression de ton compte détruit</h2>
		<p>
			Tu peux supprimer ton compte depuis ton profil. Voici ce qui se passe, précisément, parce que
			ce n'est pas anodin.
		</p>
		<ul>
			<li>
				<b>Effacé définitivement</b> — tes sessions, ton mot de passe, tes jetons, tes messages de support,
				ton historique d'achats et les images que tu as téléversées.
			</li>
			<li>
				<b>Anonymisé</b> — tes fiches de membre. Ton nom est remplacé ; email, téléphone, date de naissance,
				adresse, photo et réponses aux champs personnalisés sont effacés. Les inscriptions restent, sans
				identité, pour ne pas trouer le planning de l'évènement.
			</li>
			<li>
				<b>Détruit</b> — <b>tous les évènements dont tu es propriétaire</b>, avec leurs équipes,
				leurs pages, leurs membres et les données de leurs bénévoles. C'est irréversible, et cela
				concerne aussi les données d'autres personnes.
			</li>
		</ul>
		<p>
			Si tu veux quitter un évènement sans le détruire, transfère-en la propriété à quelqu'un
			d'autre, ou supprime seulement ta participation depuis ton profil de membre.
		</p>
	</section>

	<section>
		<h2>10. Sécurité</h2>
		<p>
			Les mots de passe sont hachés, les échanges chiffrés en HTTPS, l'accès aux serveurs restreint
			et authentifié, et les données sauvegardées régulièrement.
		</p>
		<p>
			Aucun système n'est infaillible. En cas de violation de données présentant un risque, nous
			informons les personnes concernées et les autorités compétentes dans les délais prévus par la
			loi.
		</p>
	</section>

	<section>
		<h2>11. Mineurs</h2>
		<p>
			Le bénévolat n'a pas d'âge minimum, et benevio n'en impose pas non plus. En dessous de
			<b>16 ans</b>, le compte suppose l'accord d'un représentant légal.
		</p>
		<p>
			L'organisateur qui enrôle des bénévoles mineurs est responsable de leur information et des
			autorisations parentales. Il lui revient aussi de limiter les champs personnalisés qu'il leur
			demande à ce qui est réellement nécessaire à l'évènement.
		</p>
		<p>
			Un représentant légal peut à tout moment demander l'accès aux données de son enfant ou leur
			suppression, à l'adresse indiquée au point 8. Si un compte a été ouvert par un mineur sans
			autorisation, signale-le nous : nous le supprimerons.
		</p>
	</section>

	<section>
		<h2>12. Transferts hors de Suisse et de l'Union européenne</h2>
		<p>
			Nos serveurs sont situés en Allemagne. Certains prestataires listés au point 5 sont établis
			aux États-Unis. Ces transferts s'appuient sur les clauses contractuelles types de la
			Commission européenne et, le cas échéant, sur le Data Privacy Framework.
		</p>
	</section>

	<section>
		<h2>13. Modification de cette politique</h2>
		<p>
			Nous pouvons modifier cette politique. La version applicable est celle publiée sur cette page,
			avec sa date d'effet. En cas de changement substantiel, nous t'en informons par email ou dans
			l'application avant son entrée en vigueur.
		</p>
	</section>
</LegalPage>
