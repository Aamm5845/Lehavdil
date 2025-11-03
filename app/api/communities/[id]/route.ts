import { NextResponse } from 'next/server';
import { getCommunity, updateCommunity, deleteCommunity } from '@/lib/db';
import { communitySchema } from '@/lib/validations';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const community = await getCommunity(id);
    
    if (!community) {
      return NextResponse.json(
        { error: 'Community not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ community });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch community' },
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
    const validated = communitySchema.parse(body);
    
    const community = await updateCommunity(id, validated);
    return NextResponse.json({ community });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update community' },
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
    await deleteCommunity(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete community' },
      { status: 500 }
    );
  }
}
