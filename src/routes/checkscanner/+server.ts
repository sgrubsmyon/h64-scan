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
            return new Response(JSON.stringify({ status: 'offline', error: stderr }), { status: 500 }); // { status: 'offline', error: stderr };
        }
        if (stdout.includes('No scanners were identified')) {
            return new Response(JSON.stringify({ status: 'offline', error: 'No scanners were identified' }), { status: 500 });
        }
        return new Response(JSON.stringify({ status: 'OK', output: stdout }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ status: 'offline', error: error.message }), { status: 500 });
    }
}

export async function GET() {
    const scannerStatus = await checkScannerStatus();
    return { scannerStatus };
}