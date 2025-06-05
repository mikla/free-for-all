const axios = require('axios');

// Test IP geolocation functionality
async function testGeolocation() {
  console.log('🌍 Testing IP Geolocation System\n');

  // Test with some public IPs (example IPs for different locations)
  const testIPs = [
    '8.8.8.8',        // Google DNS (Mountain View, CA)
    '1.1.1.1',        // Cloudflare DNS (San Francisco, CA)
    '208.67.222.222', // OpenDNS (San Francisco, CA)
    '185.228.168.9',  // European IP
    '103.28.248.1',   // Asian IP
  ];

  for (const ip of testIPs) {
    try {
      console.log(`📍 Testing IP: ${ip}`);
      
      const response = await axios.get(`http://ip-api.com/json/${ip}`, {
        timeout: 5000
      });

      if (response.data.status === 'success') {
        const { lat, lon: lng, city, country, regionName } = response.data;
        console.log(`   ✅ ${city}, ${regionName}, ${country}`);
        console.log(`   📍 Coordinates: ${lat}, ${lng}`);
        
        // Add random offset like in the game
        const randomOffset = () => (Math.random() - 0.5) * 0.02;
        const gameSpawn = {
          lat: lat + randomOffset(),
          lng: lng + randomOffset()
        };
        console.log(`   🎮 Game spawn: ${gameSpawn.lat.toFixed(6)}, ${gameSpawn.lng.toFixed(6)}`);
      } else {
        console.log(`   ❌ Failed: ${response.data.message}`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    console.log('');
  }

  console.log('🏠 Local/Private IPs (will use London fallback):');
  const localIPs = ['127.0.0.1', '192.168.1.1', '10.0.0.1'];
  localIPs.forEach(ip => {
    console.log(`   ${ip} → London fallback (51.5084, -0.1278)`);
  });
  
  console.log('\n🎮 In the game:');
  console.log('   • Players connect from anywhere in the world');
  console.log('   • Server detects their IP and gets their location');
  console.log('   • They spawn in their actual city/region!');
  console.log('   • South Park characters battle in real neighborhoods!');
}

testGeolocation().catch(console.error); 