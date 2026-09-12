<script lang="ts">
    import { enhance } from '$app/forms';
    import { onMount } from 'svelte';
    import DOMPurify from 'dompurify';

    let filename = $state('');
    let scannerStatus = $state({ status: 'unknown', error: '', output: '' });
    let isCheckingScanner = $state(true);
    let checkInterval: ReturnType<typeof setInterval> | null = null;

    // Access props via $props() in runes mode
    // Form props are passed from the server after a form submission
    // They contain the result of the document scanning operation, including success status and any output or error messages.
    const { form } = $props();

    // Message state is kept as $state (not derived from the `form` prop) so that
    // reset() can clear it. It is synced from `form` whenever that prop changes.
    function getMessage(f: typeof form): string {
        return f?.success !== undefined
            ? f.success
                ? f.output || 'Scan erfolgreich durchgeführt.'
                : f.error || 'Ein unbekannter Fehler ist aufgetreten.'
            : '';
    }

    let message = $state(getMessage(form));
    let isError = $state(form?.success === false);
    let now_timestamp = $state(Date.now());

    $effect(() => {
        message = getMessage(form);
        isError = form?.success === false;
    });

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

    function reset() {
        filename = '';
        message = '';
        isError = false;
        now_timestamp = Date.now();
    }

    // Initial check on page load
    onMount(() => {
        checkScanner();
    });
</script>

<div class="container">
    <h1>Dokument scannen</h1>

    <!-- Status display -->
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

    <!-- Scan form -->
    <form method="POST" use:enhance>
        <label for="filename">Dateiname ohne Endung: (optional)</label>
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
            {@html DOMPurify.sanitize(message.replaceAll('\n', '<br>'))}
        </div>
    {/if}

    <button disabled={false} onclick={reset} class="reset-button" title="Zurücksetzen">
        🗑️ Zurücksetzen
    </button>

    <a target="_blank" class="attribution" href="https://www.flaticon.com/free-icons/scanner" title="scanner icons">Favicon created by Vectors Tank - Flaticon</a>
</div>

<style>
    *,
    *::before,
    *::after {
        box-sizing: border-box;
    }

    .container {
        max-width: 600px;
        margin: 0 auto;
        padding: clamp(1rem, 0.5rem + 5vw, 2rem);
        font-family: Arial, sans-serif;
        font-size: clamp(1rem, 0.9rem + 0.6vw, 1.125rem);
        line-height: 1.5;

        display: flex;
        flex-direction: column;
        gap: clamp(0.75rem, 0.5rem + 2vw, 1rem);
    }

    h1 {
        color: #333;
        font-size: clamp(1.5rem, 1.2rem + 2vw, 2rem);
        line-height: 1.2;
    }

    .status {
        padding: 1rem;
        margin-bottom: 1rem;
        border-radius: 4px;
        text-align: center;
        overflow-wrap: anywhere;
        word-break: break-word;
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
        line-height: 1.4;
    }

    input {
        padding: 0.75rem;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: inherit;
        min-height: 44px;
    }

    button {
        padding: 0.75rem 1rem;
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: inherit;
        min-height: 44px;
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

    .attribution {
        font-size: smaller;
        color: #aaa;
        text-align: center;
        margin-top: 1rem;
        text-decoration: none;
    }
    .attribution:hover {
        text-decoration: underline;
        color: #666;
    }

    /* Small screens (phones) */
    @media (max-width: 600px) {
        .container {
            /* use the full screen width, only small side padding */
            max-width: 100%;
        }

        .status {
            text-align: left;
            font-size: 0.95rem;
        }

        button {
            width: 100%;
        }
    }
</style>