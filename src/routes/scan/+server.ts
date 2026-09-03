import { exec } from 'child_process';
import { promisify } from 'util';
// import { writeFile } from 'fs/promises';
import { join } from 'path';

const execAsync = promisify(exec);

export async function POST({ request }) {
    const formData = await request.formData();
    const filename = formData.get('filename')?.toString()?.trim() || `scan_${Date.now()}`; // Default filename with timestamp if not provided

    try {
        const outputPath = join(process.cwd(), 'static', `${filename}`);
        const command = `
        # 1. Alle Seiten als PNG scannen
        scanimage --source "ADF Duplex" --resolution 300 --format png --page-height 300 \
            --batch="${outputPath}_%03d.png"

        # 2. Zu einem einzelnen PDF zusammenfügen
        img2pdf ${outputPath}_*.png -o ${outputPath}.pdf

        # 3. Temporäre PNG-Dateien aufräumen
        rm ${outputPath}_*.png
        `;

        const { stderr } = await execAsync(command);

        if (stderr) {
            return new Response(JSON.stringify({ success: false, error: stderr }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify({ success: true, filename }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ success: false, error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}