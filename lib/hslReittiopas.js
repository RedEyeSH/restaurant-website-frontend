// Fetching hsl api
const fetchRoutes = async () => {
    const configResponse = await fetch('/config');
    const config = await configResponse.json();
    const apiKey = config.apiKey;

    try {
        const response = await fetch(`https://api.digitransit.fi/routing/v2/hsl/gtfs/v1?digitransit-subscription-key=${apiKey}`, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: `
                    {
                      stopsByRadius(lat: 60.2233, lon: 25.079895, radius: 500) {
                        edges {
                          node {
                            stop {
                              name
                              lat
                              lon
                            }
                          }
                        }
                      }
                    }
                `,
            }),
        });

        if (response.ok) {
            const data = await response.json();
            return data.data.stopsByRadius.edges.map(({ node }) => node.stop); // Return only the stops
        } else {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
    } catch (error) {
        console.error('Error fetching routes:', error);
        throw error;
    }
};

const directionsTo = async (fromLat, fromLon, toLat, toLon) => {
    const configResponse = await fetch('/config');
    const config = await configResponse.json();
    const apiKey = config.apiKey;

    try {
        const response = await fetch(`https://api.digitransit.fi/routing/v2/hsl/gtfs/v1?digitransit-subscription-key=${apiKey}`, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: `
                    {
                      plan(
                        from: { lat: ${fromLat}, lon: ${fromLon} }
                        to: { lat: ${toLat}, lon: ${toLon} }
                      ) {
                        itineraries {
                          walkDistance
                          legs {
                            mode
                            from {
                              lat
                              lon
                            }
                            to {
                              lat
                              lon
                            }
                            legGeometry {
                              points
                            }
                          }
                        }
                      }
                    }
                `,
            }),
        });

        if (response.ok) {
            const data = await response.json();
            return data
        } else {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
    } catch (error) {
        console.error('Error fetching directions:', error);
        throw error;
    }
};

export { fetchRoutes, directionsTo };
