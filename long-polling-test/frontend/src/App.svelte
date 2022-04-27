<script lang="ts">
  import axios from "axios";
  import { onDestroy, onMount } from "svelte";
  import { nanoid } from "nanoid";
  let message = "";
  let id = "";
  let messages = [];

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  async function polling() {
    try {
      const { data } = await axios.get("http://localhost:8080?id=" + id);
      messages = data.reverse();
      polling();
    } catch (e) {
      await delay(1000);
      polling();
    }
  }

  async function close() {
    await axios.delete("http://localhost:8080?id=" + id);
    console.log("closed connection!");
  }

  async function send() {
    if (message.trim() === "") return;
    const { data } = await axios.post(
      `http://localhost:8080/message?id=${id}&message=${message}`
    );
    console.log(data);
    message = "";
  }

  onMount(() => {
    id = nanoid();
    axios.get("http://localhost:8080/message").then(({ data }) => {
      messages = data.reverse();
    });
    polling();
  });

  onDestroy(() => {
    close();
  });

  function enter(e) {
    if (e.key === "Enter") {
      send();
      message = "";
    }
  }

  function deleteMessage(mid) {
    axios
      .delete(`http://localhost:8080/message/${mid}?id=${id}`)
      .then(({ data }) => {
        messages = data.reverse();
        console.log(messages);
      })
      .catch(() => {
        console.log("error");
      });
  }
</script>

<main>
  <input
    type="text"
    bind:value={message}
    on:keypress={enter}
    placeholder="Your message here!"
  />
  <button on:click={send}>send</button><br />
  {#each messages as m}
    <p>{m.message} <button on:click={() => deleteMessage(m.id)}>-</button></p>
  {/each}
</main>

<style>
  :root {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
      Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  }

  main {
    text-align: center;
    padding: 1em;
    margin: 0 auto;
  }

  img {
    height: 16rem;
    width: 16rem;
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4rem;
    font-weight: 100;
    line-height: 1.1;
    margin: 2rem auto;
    max-width: 14rem;
  }

  p {
    max-width: 14rem;
    margin: 1rem auto;
    line-height: 1.35;
  }

  @media (min-width: 480px) {
    h1 {
      max-width: none;
    }

    p {
      max-width: none;
    }
  }
</style>
