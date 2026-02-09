async function checkLocalhost() {
    console.log('Checking http://localhost:5173...');
    try {
        const response = await fetch('http://localhost:5173');
        console.log('Status Code:', response.status);
        if (response.ok) {
            console.log('Success! Localhost is accessible.');
            const text = await response.text();
            console.log('Page title found:', text.match(/<title>(.*?)<\/title>/)?.[1] || 'No title found');
        } else {
            console.error('Failed to access localhost. Status:', response.status);
        }
    } catch (error) {
        console.error('Error connecting to localhost:', error.message);
    }
}

checkLocalhost();
