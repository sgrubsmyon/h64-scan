<script lang="ts">
    import { enhance } from '$app/forms';
    import { onMount } from 'svelte';

    let filename = $state('');
    let message = $state('');
    let isError = $state(false);
    let scannerStatus = $state({ status: 'unknown', error: '', output: '' });
    let isCheckingScanner = $state(true);
    let checkInterval: ReturnType<typeof setInterval> | null = null;

    // Funktion zum Prüfen des Scanner-Status
    async function checkScanner() {
        const response = await fetch('/checkscanner');
        const data = await response.json();
        scannerStatus.status = data.status;
        scannerStatus.error = data.error || '';
        isCheckingScanner = false;

        if (scannerStatus.status !== 'OK') {
            // Alle 5 Sekunden neu prüfen, bis der Scanner verfügbar ist
            checkInterval = setInterval(async () => {
                const res = await fetch('/checkscanner');
                const newData = await res.json();
                scannerStatus.status = newData.status;
                scannerStatus.error = newData.error || '';
                if (scannerStatus.status === 'OK') {
                    scannerStatus.output = newData.output || '';
                    clearInterval(checkInterval);
                }
            }, 5000);
        } else {
            scannerStatus.output = data.output || '';
        }
    }

    // Initialen Check beim Laden der Seite
    onMount(() => {
        checkScanner();
    });

    // Funktion zum Ausführen des Scans
    async function handleSubmit({ result }) {
        console.log('Scan result:', result);
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

    <!-- Statusanzeige -->
    {#if isCheckingScanner}
        <div class="status checking">
            <p>🔍 Scanner wird gesucht...</p>
        </div>
    {:else if scannerStatus.status === 'OK'}
        <div class="status ok">
            <p>✅ Scanner bereit:</p>
            <p>{scannerStatus.output}</p>
        </div>
    {:else}
        <div class="status offline">
            <p>❌ Scanner offline:</p>
            <p>{scannerStatus.error || 'Nicht gefunden.'}</p>
            <p>Wird alle 5 Sekunden neu geprüft...</p>
        </div>
    {/if}

    <!-- Scan-Formular -->
    <form method="POST" action="/scan" use:enhance={handleSubmit}>
        <label for="filename">Dateiname:</label>
        <input
            type="text"
            id="filename"
            name="filename"
            bind:value={filename}
            placeholder="z.B. rechnung_juli"
            disabled={scannerStatus.status !== 'OK'}
        />

        <button type="submit" disabled={scannerStatus.status !== 'OK'}>
            Scan starten
        </button>
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

    .status {
        padding: 1rem;
        margin-bottom: 1rem;
        border-radius: 4px;
        text-align: center;
    }

    .checking {
        background-color: #fff3cd;
        color: #856404;
    }

    .ok {
        background-color: #dff0d8;
        color: #3c763d;
    }

    .offline {
        background-color: #f2dede;
        color: #a94442;
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

    button:disabled {
        background-color: #cccccc;
        cursor: not-allowed;
    }

    button:hover:not(:disabled) {
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