import axios from 'axios';

export async function getNutritionInfoEdamam(query: string) {

  if (!query || typeof query !== "string") {
    throw new Error("Invalid food query");
  }

  const EDAMAM_APP_ID = process.env.EDAMAM_APP_ID;
  const EDAMAM_APP_KEY = process.env.EDAMAM_APP_KEY;

  if (!EDAMAM_APP_ID || !EDAMAM_APP_KEY) {
    throw new Error("Missing Edamam API keys in environment variables");
  }

  const url = "https://api.edamam.com/api/recipes/v2";

  const params = {
    type: "public",
    q: query,
    app_id: EDAMAM_APP_ID,
    app_key: EDAMAM_APP_KEY,
    random: false
  };

  try {
    const response = await axios.get(url, { params });
    const hits = response.data.hits || [];

    return hits.map((hit: any) => {
      const r = hit.recipe;
      const yieldCount = r.yield || 1;

      const total = r.totalNutrients || {};
      return {
        name: r.label,
        image: r.image,
        source: r.source,
        url: r.url,
        calories: Math.round(r.calories || 0),
        protein: +(total.PROCNT?.quantity || 0),
        carbs: +(total.CHOCDF?.quantity || 0),
        fat: +(total.FAT?.quantity || 0),
        fiber: +(total.FIBTG?.quantity || 0),
        sugar: +(total.SUGAR?.quantity || 0),
        perServing: {
          calories: Math.round((r.calories || 0) / yieldCount),
          protein: +(((total.PROCNT?.quantity || 0) / yieldCount).toFixed(2)),
          carbs: +(((total.CHOCDF?.quantity || 0) / yieldCount).toFixed(2)),
          fat: +(((total.FAT?.quantity || 0) / yieldCount).toFixed(2)),
          fiber: +(((total.FIBTG?.quantity || 0) / yieldCount).toFixed(2)),
          sugar: +(((total.SUGAR?.quantity || 0) / yieldCount).toFixed(2))
        },
        servings: yieldCount,
        ingredients: r.ingredientLines || []
      };
    });
  } catch (err: any) {
    console.error("Edamam search error:", err.response?.data || err.message);
    throw new Error("Failed to fetch data from Edamam");
  }
}