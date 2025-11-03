import { NextResponse } from 'next/server';
import { getClasses, createClass } from '@/lib/db';
import { classSchema } from '@/lib/validations';

export async function GET() {
  try {
    const classes = await getClasses();
    return NextResponse.json({ classes });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch classes' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = classSchema.parse(body);
    
    const classItem = await createClass(validated);
    return NextResponse.json({ class: classItem }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create class' },
      { status: 400 }
    );
  }
}
