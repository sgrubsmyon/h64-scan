import { exec } from 'child_process';
import { promisify } from 'util';
// import { writeFile } from 'fs/promises';
import { join } from 'path';

const execAsync = promisify(exec);

// Funktion, um den Scanner-Status zu prüfen
async function checkScannerStatus() {
    try {
        const { stdout, stderr } = await execAsync('scanimage -L');
        if (stderr) {
            return { status: 'offline', error: stderr };
        }
        if (stdout.includes('No scanners were identified')) {
            return { status: 'offline', error: 'No scanners were identified' };
        }
        return { status: 'OK', output: stdout };
    } catch (error) {
        return { status: 'offline', error: error.message };
    }
}

export async function POST({ request }) {
    const scannerStatus = await checkScannerStatus();
    return { scannerStatus };
}