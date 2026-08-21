import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile } from 'fs/promises';
import { join } from 'path';

const execAsync = promisify(exec);

// Funktion, um den Scanner-Status zu prüfen
async function checkScannerStatus() {
    try {
        const { stdout, stderr } = await execAsync('scanimage -L');
        if (stderr) {
            return { status: 'offline', error: stderr };
        }
        return { status: 'OK', output: stdout };
    } catch (error) {
        return { status: 'offline', error: error.message };
    }
}

// Funktion zum Ausführen des Scans
export async function load({ request }) {
    // Status des Scanners prüfen
    const scannerStatus = await checkScannerStatus();
    return { scannerStatus };

    // const formData = await request.formData();
    // const filename = formData.get('filename')?.trim() || 'scan';

    // if (!filename) {
    //     return { success: false, error: 'Bitte einen Dateinamen angeben.' };
    // }

    // try {
    //     // 1. Scan ausführen und als PDF speichern
    //     const outputPath = join(process.cwd(), 'static', `${filename}.pdf`);
    //     const command = `scanimage --format=pdf > ${outputPath}`;

    //     const { stderr } = await execAsync(command);

    //     if (stderr) {
    //         console.error('Fehler beim Scannen:', stderr);
    //         return { success: false, error: stderr };
    //     }

    //     // 2. Erfolg melden
    //     return { success: true, filename };
    // } catch (error) {
    //     console.error('Fehler:', error);
    //     return { success: false, error: error.message };
    // }
}
