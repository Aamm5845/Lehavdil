import { NextResponse } from 'next/server';
import { getSchools, createSchool } from '@/lib/db';
import { schoolSchema } from '@/lib/validations';

export async function GET() {
  try {
    const schools = await getSchools();
    return NextResponse.json({ schools });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch schools' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = schoolSchema.parse(body);
    
    const school = await createSchool(validated);
    return NextResponse.json({ school }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create school' },
      { status: 400 }
    );
  }
}
