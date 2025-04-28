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
                        routes(name: "M1") {
                            stops {
                                id
                                name
                            }
                        }
                    }
                `,
            }),
        });

        if (response.ok) {
            const data = await response.json(); // Parse the JSON response
            console.log('Response data:', data); // Log the response data
        } else {
            console.error('Error:', response.status, response.statusText); // Log error details
        }
    } catch (error) {
        console.error('Error fetching routes:', error); // Log any network or runtime errors
    }
};

export { fetchRoutes };