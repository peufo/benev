<script>
	import { CopyText } from '$lib/material'
	import { eventPath } from '$lib/store'
</script>

<CopyText label="Lien de la page d'accueil de l'évènement" value="https://benev.ch{$eventPath}" />
<CopyText label="Lien d'invitation à devenir membre" value="https://benev.ch{$eventPath}/invite" />
