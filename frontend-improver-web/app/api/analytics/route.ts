import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const data = await request.json();
    const { type, data: interactionData, timestamp } = data;

    // Store the interaction in the database
    const interaction = await prisma.interaction.create({
      data: {
        type,
        data: interactionData,
        timestamp: new Date(timestamp),
        userId: session.user?.id as string,
        repository: session.user?.repository as string,
      },
    });

    return NextResponse.json({ success: true, interaction });
  } catch (error) {
    console.error('Error saving analytics:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const repository = searchParams.get('repository');

    if (!repository) {
      return new NextResponse('Repository parameter is required', { status: 400 });
    }

    // Get interactions for the repository
    const interactions = await prisma.interaction.findMany({
      where: {
        repository,
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    return NextResponse.json({ interactions });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 