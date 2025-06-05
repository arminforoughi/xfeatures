import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/auth.config';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, data, timestamp, repository } = body;

    if (!repository) {
      return NextResponse.json(
        { error: 'Repository is required' },
        { status: 400 }
      );
    }

    // Store the interaction in the database
    const interaction = await prisma.interaction.create({
      data: {
        type,
        data: JSON.stringify(data),
        timestamp: new Date(timestamp),
        userId: session.user?.email || 'anonymous',
        repository,
      },
    });

    return NextResponse.json({ success: true, interaction });
  } catch (error) {
    console.error('Error storing interaction:', error);
    return NextResponse.json(
      { error: 'Failed to store interaction' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const repository = searchParams.get('repository');
    const range = searchParams.get('range') || '7d';

    if (!repository) {
      return NextResponse.json(
        { error: 'Repository is required' },
        { status: 400 }
      );
    }

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    switch (range) {
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      // 'all' doesn't need a start date
    }

    // Get interactions for the repository
    const interactions = await prisma.interaction.findMany({
      where: {
        repository,
        ...(range !== 'all' ? {
          timestamp: {
            gte: startDate
          }
        } : {})
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    // Transform the data to include parsed JSON data
    const transformedInteractions = interactions.map(interaction => ({
      ...interaction,
      data: JSON.parse(interaction.data as string)
    }));

    return NextResponse.json(transformedInteractions);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
} 