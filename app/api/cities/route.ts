import { NextRequest, NextResponse } from 'next/server';
import { getCities, createCity } from '@/lib/db';
import { citySchema } from '@/lib/validations';

// GET /api/cities - List all cities
export async function GET() {
  try {
    const cities = await getCities();
    return NextResponse.json({ cities });
  } catch (error) {
    console.error('Error fetching cities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cities' },
      { status: 500 }
    );
  }
}

// POST /api/cities - Create a new city
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validated = citySchema.parse(body);
    
    // Create city
    const city = await createCity(validated);
    
    return NextResponse.json(city, { status: 201 });
  } catch (error: any) {
    console.error('Error creating city:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create city' },
      { status: 500 }
    );
  }
}
