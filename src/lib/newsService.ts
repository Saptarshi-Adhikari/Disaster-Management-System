// src/lib/newsService.ts

export const fetchWestBengalNews = async (city: string = "") => {
  try {
    const query = city && city !== "All West Bengal" 
      ? `West Bengal ${city} emergency alerts` 
      : `West Bengal breaking news emergency`;
    
    const RSS_URL = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-IN&gl=IN&ceid=IN:en`;
    
    const response = await fetch(
      `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(RSS_URL)}`
    );
    
    if (!response.ok) throw new Error('Failed to fetch RSS data');
    const data = await response.json();

    // Improved HTML cleaner to remove link tags and extra whitespace
    const cleanHTML = (html: string) => {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const text = doc.body.textContent || "";
      return text.replace(/<[^>]*>?/gm, '').trim(); 
    };
    
    return (data.items || []).map((item: any) => {
      const title = item.title || "";
      // Get the first sentence or first 120 chars of the cleaned description
      const fullDetails = cleanHTML(item.description || "");
      
      let type: "critical" | "warning" | "info" = "info";
      const criticalKeywords = ["accident", "death", "fire", "killed", "blast", "emergency", "dead", "flood", "cyclone", "collapsed"];
      const warningKeywords = ["alert", "warning", "delay", "protest", "traffic", "weather", "rain", "fog", "strike", "intensive revision"];
      
      if (criticalKeywords.some(key => title.toLowerCase().includes(key))) type = "critical";
      else if (warningKeywords.some(key => title.toLowerCase().includes(key))) type = "warning";

      return {
        id: item.link, 
        type: type, 
        title: title.split(" - ")[0], // Removes the source suffix from the title for cleaner UI
        message: fullDetails.slice(0, 110) + (fullDetails.length > 110 ? "..." : ""),
        fullDetails: fullDetails,
        time: new Date(item.pubDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        location: city || "West Bengal",
        source: item.author || title.split(" - ").pop() || "News Source",
        affectedArea: city ? `${city} Region` : "Statewide"
      };
    });
  } catch (error) {
    console.error("Error fetching news:", error);
    return [];
  }
};