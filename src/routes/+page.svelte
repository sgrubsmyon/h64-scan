<script lang="ts">
    import { enhance } from '$app/forms';

    let filename = '';
    let message = '';
    let isError = false;

    async function handleSubmit({ formData }) {
        const response = await fetch('/', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            message = `Scan erfolgreich unter ${result.filename}.pdf gespeichert!`;
            isError = false;
        } else {
            message = result.error || 'Ein unbekannter Fehler ist aufgetreten.';
            isError = true;
        }
    }
</script>

<div class="container">
    <h1>Dokument scannen</h1>

    <form method="POST" use:enhance={handleSubmit}>
        <label for="filename">Dateiname:</label>
        <input
            type="text"
            id="filename"
            name="filename"
            bind:value={filename}
            placeholder="z.B. rechnung_juli"
            required
        />

        <button type="submit">Scan starten</button>
    </form>

    {#if message}
        <div class="message {isError ? 'error' : 'success'}">
            {message}
        </div>
    {/if}
</div>

<style>
    .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 2rem;
        font-family: Arial, sans-serif;
    }

    h1 {
        color: #333;
    }

    form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    label {
        font-weight: bold;
    }

    input {
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 4px;
    }

    button {
        padding: 0.5rem 1rem;
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }

    button:hover {
        background-color: #45a049;
    }

    .message {
        margin-top: 1rem;
        padding: 0.5rem;
        border-radius: 4px;
    }

    .success {
        background-color: #dff0d8;
        color: #3c763d;
    }

    .error {
        background-color: #f2dede;
        color: #a94442;
    }
</style>