import { NextResponse } from 'next/server';

const GEOCODING_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    if (!lat || !lng) {
      return NextResponse.json(
        { success: false, error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    // First try to get nearby places (more accurate for businesses/restaurants)
    const placesResponse = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=100&type=restaurant|establishment&key=${GEOCODING_API_KEY}`
    );

    const placesData = await placesResponse.json();

    if (placesData.status === 'OK' && placesData.results.length > 0) {
      // Get detailed place information for the nearest result
      const placeId = placesData.results[0].place_id;
      const detailsResponse = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=formatted_address,name&key=${GEOCODING_API_KEY}`
      );

      const detailsData = await detailsResponse.json();
      
      if (detailsData.status === 'OK') {
        const address = `${detailsData.result.name}, ${detailsData.result.formatted_address}`;
        return NextResponse.json({ success: true, address });
      }
    }

    // Fallback to reverse geocoding if no places found
    const geocodeResponse = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&result_type=establishment|point_of_interest|premise&key=${GEOCODING_API_KEY}`
    );

    const geocodeData = await geocodeResponse.json();

    if (geocodeData.status === 'OK' && geocodeData.results.length > 0) {
      const address = geocodeData.results[0].formatted_address;
      return NextResponse.json({ success: true, address });
    }

    throw new Error('No suitable address found');
  } catch (error) {
    console.error('Error getting location:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get location' },
      { status: 500 }
    );
  }
}
