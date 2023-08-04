
<script lang="ts">
  import JSConfetti from 'js-confetti'

  let dialog: HTMLDialogElement

  export function open() {
    dialog.showModal()
    const jsConfetti = new JSConfetti()
    jsConfetti.addConfetti({
      confettiRadius: 10,
      confettiNumber: 200,
    })
  }

</script>


<dialog bind:this={dialog} class="modal">
  
  
  <div class="modal-box flex flex-col gap-4">
    <h2 class="text-center text-2xl">Un énorme merci !</h2>
    
    <p>
      Tu recevras une confirmation par mail dés qu'un responsable de l'équipe aura validé ton inscription.
    </p>
    
    <div class="flex gap-2 justify-end">
      <button class="btn" on:click={() => dialog.close()}>OK ça joue</button>
    </div>
    
  </div>

</dialog>