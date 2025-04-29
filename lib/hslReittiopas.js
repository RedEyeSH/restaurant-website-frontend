// Fetching HSL API
const fetchRoutes = async () => {
    const configResponse = await fetch('/config');
    const config = await configResponse.json();
    const apiKey = config.apiKey;

    try {
        const response = await fetch(
            `https://api.digitransit.fi/routing/v2/hsl/gtfs/v1?digitransit-subscription-key=${apiKey}`,
            {
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
            }
        );

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
        const response = await fetch(
            `https://api.digitransit.fi/routing/v2/hsl/gtfs/v1?digitransit-subscription-key=${apiKey}`,
            {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: `
                        {
                          planConnection(
                            origin: {
                              location: { coordinate: { latitude: ${fromLat}, longitude: ${fromLon} } }
                            }
                            destination: {
                              location: { coordinate: { latitude: ${toLat}, longitude: ${toLon} } }
                            }
                            first: 3
                            modes: {
                              transit: {
                                transit: [
                                  { mode: BUS }
                                  { mode: TRAM }
                                  { mode: RAIL }
                                  { mode: SUBWAY }
                                ]
                              }
                            }
                          ) {
                            edges {
                              node {
                                duration
                                walkDistance
                                legs {
                                  from {
                                    lat
                                    lon
                                    name
                                  }
                                  to {
                                    lat
                                    lon
                                    name
                                  }
                                  trip {
                                    routeShortName
                                    tripHeadsign
                                  }
                                  legGeometry {
                                    points
                                  }
                                  mode
                                }
                              }
                            }
                          }
                        }
                    `,
                }),
            }
        );
        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
    } catch (error) {
        console.error('Error fetching directions:', error);
        throw error;
    }
};

const getRouteSummaries = async (fromLat, fromLon, toLat, toLon) => {
    try {
        const data = await directionsTo(fromLat, fromLon, toLat, toLon);
        const edges = data?.data?.planConnection?.edges;

        if (!edges || edges.length === 0) {
            console.error("No routes found.");
            return [];
        }

        const itineraries = edges.map(edge => edge.node);

        const summaries = itineraries.map((itinerary, index) => {
            const durationMin = Math.round(itinerary.duration / 60);
            const walkDist = Math.round(itinerary.walkDistance);
            const steps = itinerary.legs.map(leg => {
                if (leg.mode === "WALK") {
                    return `🚶‍♂️ Walk to "${leg.to.name}"`;
                } else {
                    return `🚍 Take ${leg.mode} ${leg.trip?.routeShortName || ""} toward "${leg.trip?.tripHeadsign}"`;
                }
            });

            return `Option ${index + 1} (${durationMin} min, walk ${walkDist}m):\n` + steps.join("\n");
        });

        return summaries;
    } catch (error) {
        console.error("Error fetching route summaries:", error);
        return [];
    }
};

export { fetchRoutes, directionsTo, getRouteSummaries };