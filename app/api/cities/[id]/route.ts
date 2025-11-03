import { NextRequest, NextResponse } from 'next/server';
import { getCity, updateCity, deleteCity } from '@/lib/db';
import { citySchema } from '@/lib/validations';

// GET /api/cities/[id] - Get a single city
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const city = await getCity(id);
    
    if (!city) {
      return NextResponse.json(
        { error: 'City not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ city });
  } catch (error) {
    console.error('Error fetching city:', error);
    return NextResponse.json(
      { error: 'Failed to fetch city' },
      { status: 500 }
    );
  }
}

// PUT /api/cities/[id] - Update a city
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const body = await request.json();
    const validated = citySchema.parse(body);
    
    const city = await updateCity(id, validated);
    return NextResponse.json(city);
  } catch (error: any) {
    console.error('Error updating city:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    if (error.message === 'City not found') {
      return NextResponse.json(
        { error: 'City not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update city' },
      { status: 500 }
    );
  }
}

// DELETE /api/cities/[id] - Delete a city (cascading)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await deleteCity(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting city:', error);
    return NextResponse.json(
      { error: 'Failed to delete city' },
      { status: 500 }
    );
  }
}
