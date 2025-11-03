import { NextResponse } from 'next/server';
import { getTimeBlocks, createTimeBlock } from '@/lib/db';
import { timeBlockSchema } from '@/lib/validations';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const dayType = searchParams.get('dayType');
    
    let timeBlocks = await getTimeBlocks(classId || undefined);
    
    // Filter by dayType if provided
    if (dayType) {
      timeBlocks = timeBlocks.filter(tb => tb.dayType === dayType);
    }
    
    // Sort by sortOrder
    timeBlocks.sort((a, b) => a.sortOrder - b.sortOrder);
    
    return NextResponse.json({ timeBlocks });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch time blocks' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Check if bulk operation
    if (Array.isArray(body)) {
      const timeBlocks = [];
      for (const item of body) {
        const validated = timeBlockSchema.parse(item);
        const timeBlock = await createTimeBlock(validated);
        timeBlocks.push(timeBlock);
      }
      return NextResponse.json({ timeBlocks, count: timeBlocks.length }, { status: 201 });
    }
    
    // Single time block
    const validated = timeBlockSchema.parse(body);
    const timeBlock = await createTimeBlock(validated);
    return NextResponse.json({ timeBlock }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create time block' },
      { status: 400 }
    );
  }
}
