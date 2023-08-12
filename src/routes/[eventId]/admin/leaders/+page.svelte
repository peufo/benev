<script lang="ts">
	import Contact from '$lib/Contact.svelte'


  export let data

</script>

<h2>
  TODO: table avec prénom, nom, équipes à charges, (droit sur l'évenement)
</h2>

<table class="table">
  <thead>
    <tr>
      <th>Responsable</th>
      <th>Équipes à charges</th>
    </tr>
  </thead>

  <tbody>
    {#each data.users as user}

    <tr>
      <td>{user.firstName} {user.lastName}</td>
      <td>
        <div class="badge badge-lg">
          {user.leaders.length}
        </div>
      </td>
      <td align="right">
        <Contact {user} />
      </td>
    </tr>

    {/each}

  </tbody>


</table>