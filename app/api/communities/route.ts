import { NextRequest, NextResponse } from 'next/server';
import { getCommunities, createCommunity } from '@/lib/db';
import { communitySchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const cityId = searchParams.get('cityId');
    
    const communities = await getCommunities();
    
    // Filter by cityId if provided
    const filtered = cityId 
      ? communities.filter(c => c.cityId === cityId)
      : communities;
    
    return NextResponse.json({ communities: filtered });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch communities' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = communitySchema.parse(body);
    
    const community = await createCommunity(validated);
    return NextResponse.json({ community }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create community' },
      { status: 400 }
    );
  }
}
