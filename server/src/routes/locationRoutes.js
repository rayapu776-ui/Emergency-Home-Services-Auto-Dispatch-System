import express from "express";

const router = express.Router();

/**
 * Helper to format Google Geocoding result into readable city/locality
 */
function parseGoogleAddress(result) {
  if (!result || !result.address_components) return null;

  let locality = "";
  let sublocality = "";
  let city = "";
  let state = "";
  let country = "";
  let postalCode = "";

  for (const comp of result.address_components) {
    const types = comp.types;
    if (
      types.includes("sublocality") ||
      types.includes("sublocality_level_1")
    ) {
      sublocality = comp.long_name;
    } else if (types.includes("locality")) {
      city = comp.long_name;
    } else if (types.includes("administrative_area_level_2") && !city) {
      city = comp.long_name;
    } else if (types.includes("administrative_area_level_1")) {
      state = comp.long_name;
    } else if (types.includes("country")) {
      country = comp.long_name;
    } else if (types.includes("postal_code")) {
      postalCode = comp.long_name;
    }
  }

  // Create clean short readable address
  const parts = [sublocality, city, state, country].filter(Boolean);
  const formatted =
    parts.length > 0 ? parts.join(", ") : result.formatted_address;

  return {
    formattedAddress: formatted,
    fullAddress: result.formatted_address,
    city: city || sublocality || "Delhi NCR",
    state: state || "Delhi",
    country: country || "India",
    postalCode,
  };
}

/**
 * Helper to format Nominatim reverse geocode result
 */
function parseNominatimAddress(data) {
  if (!data || !data.address) return null;
  const a = data.address;

  const locality =
    a.suburb ||
    a.neighbourhood ||
    a.residential ||
    a.subdistrict ||
    a.quarter ||
    "";
  const city =
    a.city || a.town || a.municipality || a.district || a.county || "Delhi NCR";
  const state = a.state || a.region || "Delhi";
  const country = a.country || "India";
  const postalCode = a.postcode || "";

  const parts = [locality, city, state, country].filter(Boolean);
  const formattedAddress =
    parts.length > 0 ? parts.join(", ") : data.display_name;

  return {
    formattedAddress,
    fullAddress: data.display_name,
    city,
    state,
    country,
    postalCode,
  };
}

// GET /api/location/reverse-geocode?lat=...&lon=...
router.get("/reverse-geocode", async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lon = parseFloat(req.query.lon);

    if (isNaN(lat) || isNaN(lon)) {
      return res
        .status(400)
        .json({ error: "Valid latitude and longitude required" });
    }

    const googleKey = process.env.GOOGLE_MAPS_API_KEY;

    // 1. Try Google Maps Geocoding API if key is provided
    if (googleKey && googleKey !== "your-google-maps-api-key-here") {
      try {
        const googleUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${googleKey}`;
        const gResponse = await fetch(googleUrl);
        const gData = await gResponse.json();

        if (
          gData.status === "OK" &&
          gData.results &&
          gData.results.length > 0
        ) {
          const parsed = parseGoogleAddress(gData.results[0]);
          return res.json({
            success: true,
            provider: "google",
            lat,
            lon,
            ...parsed,
          });
        }
      } catch (gErr) {
        console.warn(
          "Google Maps Geocoding failed, falling back to reverse geocoder:",
          gErr.message,
        );
      }
    }

    // 2. Fallback to OpenStreetMap Nominatim
    try {
      const nomUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&addressdetails=1`;
      const nResponse = await fetch(nomUrl, {
        headers: {
          "User-Agent": "ArgentYourApp/1.0 (contact@argentyour.com)",
        },
      });

      if (nResponse.ok) {
        const nData = await nResponse.json();
        const parsed = parseNominatimAddress(nData);
        if (parsed) {
          return res.json({
            success: true,
            provider: "nominatim",
            lat,
            lon,
            ...parsed,
          });
        }
      }
    } catch (nErr) {
      console.warn("Nominatim Geocoding failed:", nErr.message);
    }

    // Default coordinate-derived fallback
    return res.json({
      success: true,
      provider: "coordinates",
      lat,
      lon,
      formattedAddress: `Current Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`,
      city: "Current Location",
      state: "India",
      country: "India",
    });
  } catch (err) {
    console.error("Error in reverse-geocode:", err);
    return res
      .status(500)
      .json({ error: "Failed to reverse geocode location" });
  }
});

// GET /api/location/search?query=...
router.get("/search", async (req, res) => {
  try {
    const q = req.query.query ? req.query.query.trim() : "";
    if (!q || q.length < 2) {
      return res.json({ success: true, suggestions: [] });
    }

    const googleKey = process.env.GOOGLE_MAPS_API_KEY;

    // 1. Try Google Places or Geocoding API if key configured
    if (googleKey && googleKey !== "your-google-maps-api-key-here") {
      try {
        const gUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          q,
        )}&key=${googleKey}&components=country:in`;
        const gRes = await fetch(gUrl);
        const gData = await gRes.json();

        if (gData.status === "OK" && gData.predictions) {
          const suggestions = gData.predictions.map((p) => ({
            formattedAddress: p.description,
            placeId: p.place_id,
            mainText: p.structured_formatting?.main_text || p.description,
            secondaryText: p.structured_formatting?.secondary_text || "",
          }));
          return res.json({ success: true, provider: "google", suggestions });
        }
      } catch (gErr) {
        console.warn(
          "Google Places Autocomplete failed, falling back to search:",
          gErr.message,
        );
      }
    }

    // 2. Fallback to Nominatim Search
    try {
      const nomUrl = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
        q,
      )}&addressdetails=1&limit=6&countrycodes=in`;
      const nRes = await fetch(nomUrl, {
        headers: {
          "User-Agent": "ArgentYourApp/1.0 (contact@argentyour.com)",
        },
      });

      if (nRes.ok) {
        const nData = await nRes.json();
        const suggestions = nData.map((item) => {
          const parsed = parseNominatimAddress(item);
          return {
            formattedAddress: parsed?.formattedAddress || item.display_name,
            mainText: parsed?.city || item.name || q,
            secondaryText: parsed?.state
              ? `${parsed.state}, ${parsed.country}`
              : item.display_name,
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon),
          };
        });
        return res.json({ success: true, provider: "nominatim", suggestions });
      }
    } catch (nErr) {
      console.warn("Nominatim search failed:", nErr.message);
    }

    return res.json({ success: true, suggestions: [] });
  } catch (err) {
    console.error("Error in location search:", err);
    return res.status(500).json({ error: "Failed to search locations" });
  }
});

export default router;
