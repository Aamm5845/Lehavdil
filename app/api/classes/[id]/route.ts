import { NextResponse } from 'next/server';
import { getClass, updateClass, deleteClass } from '@/lib/db';
import { classSchema } from '@/lib/validations';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const classItem = await getClass(id);
    
    if (!classItem) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ class: classItem });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch class' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = classSchema.parse(body);
    
    const classItem = await updateClass(id, validated);
    return NextResponse.json({ class: classItem });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update class' },
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
    await deleteClass(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete class' },
      { status: 500 }
    );
  }
}
