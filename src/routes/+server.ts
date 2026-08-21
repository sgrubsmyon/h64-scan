import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile } from 'fs/promises';
import { join } from 'path';

const execAsync = promisify(exec);

export async function POST({ request }) {
    const formData = await request.formData();
    const filename = formData.get('filename')?.trim() || 'scan';

    try {
        const outputPath = join(process.cwd(), 'static', `${filename}.pdf`);
        const command = `scanimage --format=pdf > ${outputPath}`;

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