import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '7d';
    
    // Create analytics directory if it doesn't exist
    const analyticsDir = path.join(process.cwd(), 'analytics');
    if (!fs.existsSync(analyticsDir)) {
      fs.mkdirSync(analyticsDir, { recursive: true });
    }

    // Get all analytics files
    const files = fs.readdirSync(analyticsDir)
      .filter(file => file.endsWith('.json'))
      .map(file => path.join(analyticsDir, file));

    // Filter files based on time range
    const now = new Date();
    const filteredFiles = files.filter(file => {
      const fileDate = new Date(file.split('/').pop()?.split('.')[0] || '');
      switch (range) {
        case '7d':
          return now.getTime() - fileDate.getTime() <= 7 * 24 * 60 * 60 * 1000;
        case '30d':
          return now.getTime() - fileDate.getTime() <= 30 * 24 * 60 * 60 * 1000;
        default:
          return true;
      }
    });

    // Read and combine all analytics data
    const analytics = filteredFiles.flatMap(file => {
      const content = fs.readFileSync(file, 'utf-8');
      return JSON.parse(content);
    });

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error reading analytics:', error);
    return NextResponse.json(
      { error: 'Failed to read analytics' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Create analytics directory if it doesn't exist
    const analyticsDir = path.join(process.cwd(), 'analytics');
    if (!fs.existsSync(analyticsDir)) {
      fs.mkdirSync(analyticsDir, { recursive: true });
    }

    // Create a file for today's analytics
    const today = new Date().toISOString().split('T')[0];
    const analyticsFile = path.join(analyticsDir, `${today}.json`);

    // Read existing analytics or create new array
    let analytics = [];
    if (fs.existsSync(analyticsFile)) {
      const content = fs.readFileSync(analyticsFile, 'utf-8');
      analytics = JSON.parse(content);
    }

    // Add new interaction with variant information
    analytics.push({
      ...data,
      timestamp: new Date().toISOString(),
      variant: data.variant || 'original' // Default to 'original' if not specified
    });

    // Write back to file
    fs.writeFileSync(analyticsFile, JSON.stringify(analytics, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving analytics:', error);
    return NextResponse.json(
      { error: 'Failed to save analytics' },
      { status: 500 }
    );
  }
} 