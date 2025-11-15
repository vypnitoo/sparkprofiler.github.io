/**
 * Fetches Spark profiler data using the same method as the official viewer
 */

const BYTEBIN_URL = 'https://spark-usercontent.lucko.me';

export async function fetchSparkData(code: string): Promise<any> {
  console.log(`🔍 Fetching from ByteBin: ${BYTEBIN_URL}/${code}`);

  try {
    // Fetch protobuf data from bytebin
    const response = await fetch(`${BYTEBIN_URL}/${code}`, {
      headers: {
        'Accept': 'application/x-spark-sampler',
      },
    });

    if (!response.ok) {
      throw new Error(`ByteBin fetch failed: ${response.statusText}`);
    }

    // Get the data - it's protobuf binary
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    console.log(`✅ Received ${uint8Array.length} bytes of protobuf data`);

    // For now, we'll use the JSON API endpoint instead since protobuf parsing
    // requires additional libraries. The spark viewer uses protobuf.js.
    // Let's use the metadata endpoint which includes platform statistics
    return await fetchMetadataWithStats(code);

  } catch (error) {
    console.error('❌ ByteBin fetch error:', error);
    throw error;
  }
}

/**
 * Fallback: Use metadata endpoint with extended data
 */
async function fetchMetadataWithStats(code: string): Promise<any> {
  // Try the raw endpoint with different parameters
  const attempts = [
    `https://spark.lucko.me/${code}?raw=1&full=true`,
    `https://spark.lucko.me/${code}?raw=1`,
  ];

  for (const url of attempts) {
    try {
      console.log(`🔄 Trying: ${url}`);
      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Got data from:`, url);
        console.log('Data keys:', Object.keys(data));
        console.log('platformStatistics:', data.platformStatistics);
        return data;
      }
    } catch (err) {
      console.warn(`Failed attempt: ${url}`, err);
    }
  }

  throw new Error('All fetch attempts failed');
}
