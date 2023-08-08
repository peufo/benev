<script lang="ts">

  export let data

  
  const teamsIds = data.subscribes.map(s => s.period.teamId)
  // data.events.map(e => e.teams.map(t => t.id)).flat()

  
  
</script>
<div class="flex flex-col gap-10">

  {#each data.events as event}
    <section>
      <a class="text-xl link link-hover" href="/{event.id}" >{event.name}</a>
      <table class="table mt-2">
        <thead>
          <tr>
            <th>Équipe</th>
            <th>Période</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {#each event.teams.filter(t => teamsIds.includes(t.id)) as team}
            {@const subscribes = data.subscribes.filter(s => s.period.teamId === team.id)}

            <tr>
              <td>{team.name}</td>
              <td>
                <table>
                  <tbody>
                    {#each subscribes as {period, state}}
                      <tr>
                        <td>{period.start.toLocaleString()}</td>
                        <td>{state}</td>
                      </tr>
                    {/each}
                  </tbody>
                </table>

              </td>
            </tr>
          {/each}
        </tbody>
      </table>
  
    </section>
    
  {:else}

    <p class="text-center">
      Aucune inscription pour le moment
      <br>
      <br>
      <a href="/" class="btn">
        Trouve un évenement
      </a>

    </p>

  {/each}
</div>