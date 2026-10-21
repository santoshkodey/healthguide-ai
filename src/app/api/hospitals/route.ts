import { NextRequest, NextResponse } from 'next/server';
import { hospitalSearchSchema } from '@/lib/validation';
import { searchHospitals } from '@/lib/hospitals';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query') || undefined;
    const latStr = searchParams.get('lat') || undefined;
    const lngStr = searchParams.get('lng') || undefined;
    const radiusStr = searchParams.get('radius') || undefined;

    const parsed = hospitalSearchSchema.safeParse({
      query,
      lat: latStr,
      lng: lngStr,
      radius: radiusStr,
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please enter a search location (city or area) or provide latitude and longitude coordinates.',
          details: parsed.error.format(),
        },
        { status: 400 }
      );
    }

    const searchResponse = await searchHospitals({
      query: parsed.data.query,
      lat: parsed.data.lat,
      lng: parsed.data.lng,
      radiusMeters: parsed.data.radius,
    });

    return NextResponse.json(searchResponse);
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: 'Unable to query healthcare facilities due to a temporary network issue.',
      },
      { status: 500 }
    );
  }
}
