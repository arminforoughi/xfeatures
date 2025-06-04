import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { repo } = await request.json();
    
    if (!repo) {
      return NextResponse.json(
        { message: 'Repository name is required' },
        { status: 400 }
      );
    }

    // Convert repo name to directory name (e.g., "owner/repo" -> "owner_repo")
    const dirName = repo.replace('/', '_');
    const tempDir = path.join(process.cwd(), 'temp', dirName);

    // Check if directory exists
    if (fs.existsSync(tempDir)) {
      // Remove directory and its contents
      fs.rmSync(tempDir, { recursive: true, force: true });
    }

    return NextResponse.json({ message: 'Cleanup successful' });
  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json(
      { message: 'Failed to clean up temporary directory' },
      { status: 500 }
    );
  }
} 