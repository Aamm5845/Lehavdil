import { NextResponse } from 'next/server';
import { getSchool, updateSchool, deleteSchool } from '@/lib/db';
import { schoolSchema } from '@/lib/validations';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const school = await getSchool(id);
    
    if (!school) {
      return NextResponse.json(
        { error: 'School not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ school });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch school' },
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
    const validated = schoolSchema.parse(body);
    
    const school = await updateSchool(id, validated);
    return NextResponse.json({ school });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update school' },
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
    await deleteSchool(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete school' },
      { status: 500 }
    );
  }
}
