// Get JWT token from production dashboard
async function getToken() {
    const response = await fetch('https://dfo.solaria.agency/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: 'carlosjperez',
            password: 'bypass'
        })
    });

    const data = await response.json();
    if (data.token) {
        console.log(data.token);
    } else {
        console.error('Failed to get token:', data);
        process.exit(1);
    }
}

getToken();
