<script lang="ts">
	import type { User } from "lucia"


  export let user: User

</script>

<div class="grid h-full place-content-center p-10">
	<div class="card w-96 place-content-center bg-base-100 shadow-xl">
    
    <h2 class="text-xl p-4">Bonjour {user.name}</h2>

    <div class="card-body">
      <ul>
        <li>Mes shifts</li>
      </ul>
     <form method="POST" action="?/logout" class="w-full">
        <input type="submit" value="Déconnexion" class="btn"/>
      </form>
      
    </div>

  
  </div>
</div>