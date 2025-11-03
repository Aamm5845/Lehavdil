import { NextResponse } from 'next/server';
import { updateTimeBlock, deleteTimeBlock } from '@/lib/db';
import { timeBlockSchema } from '@/lib/validations';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = timeBlockSchema.parse(body);
    
    const timeBlock = await updateTimeBlock(id, validated);
    return NextResponse.json({ timeBlock });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update time block' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteTimeBlock(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete time block' },
      { status: 500 }
    );
  }
}
