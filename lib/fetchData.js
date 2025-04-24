export async function fetchData(url, options = {}) {
  try {
      const response = await fetch(url, options);

      let json;
      try {
          json = await response.json();
      } catch (error) {
          throw new Error(`Failed to parse JSON. Response status: ${response.status}`);
      }

      if (!response.ok) {
          throw new Error(`Error ${response.status} occured!`);
      }

      return json;
  } catch (error) {
      throw new Error(`Request failed: ${error.message}`);
  }
}