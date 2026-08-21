import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile } from 'fs/promises';
import { join } from 'path';

const execAsync = promisify(exec);

// Funktion zum Ausführen des Scans
export async function load({ request }) {
    const formData = await request.formData();
    const filename = formData.get('filename')?.trim() || 'scan';

    if (!filename) {
        return { success: false, error: 'Bitte einen Dateinamen angeben.' };
    }

    try {
        // 1. Scan ausführen und als PDF speichern
        const outputPath = join(process.cwd(), 'static', `${filename}.pdf`);
        const command = `scanimage --format=pdf > ${outputPath}`;

        const { stderr } = await execAsync(command);

        if (stderr) {
            console.error('Fehler beim Scannen:', stderr);
            return { success: false, error: stderr };
        }

        // 2. Erfolg melden
        return { success: true, filename };
    } catch (error) {
        console.error('Fehler:', error);
        return { success: false, error: error.message };
    }
}
