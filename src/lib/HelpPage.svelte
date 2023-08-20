<script lang="ts">

	import { eventPath } from "$lib/store"

</script>
<h2>Salut 👋</h2>
<p>
	Voici les étapes clés pour configurer ton espace.
</p>

<section>

  <h3>Édition des pages</h3>
  
  <p>
    Tu devrais 
    <a href="{$eventPath}/admin/pages">éditer la page d'accueil</a>
    pour passer les infos les plus importante à tes futures bénévoles.
    Tu peux également librement créer d'autres pages complémentaires (FAQ, conditions, etc...).
  </p>

</section>

<section>
  <h3>Secteurs</h3>
  <p>
    <a href="{$eventPath}/teams">Créer des secteurs</a>
    et de nouvelles périodes de travail.
    Tu pourras ensuite nommer tes membres comme responsable de secteur.
  </p>
</section>

<section>
  <h3>Partage</h3>
  <p>
    Envoie tes bénévoles sur ta page d'accueil
    👉 <b>benev.ch{$eventPath}</b>
  </p>
  <p>
    Tu peux aussi directement les inviter à devenir membre
    👉 <b>benev.ch{$eventPath}/invite</b>
  </p>
</section>
