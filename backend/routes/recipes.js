const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const axios = require('axios');
const authenticateToken = require('../middleware/auth'); 
const dotenv = require('dotenv');

dotenv.config();


/**
 * Converts a string to Title Case.
 * @param {string} str The string to convert.
 * @returns {string} The Title Cased string.
 */
function toTitleCase(str) {
  if (!str) return '';
  // Convert the whole string to lowercase, then replace the first letter of each word boundary with its uppercase version.
  // Handles hyphens correctly (e.g., "stir-fry" -> "Stir-Fry")
  return str.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
}

/**
* Sanitizes a string, allowing letters (Unicode), numbers, spaces, hyphens, and apostrophes.
* Removes other characters and trims whitespace.
* @param {string} str The string to sanitize.
* @returns {string} The sanitized string.
*/
function sanitizeString(str) {
  if (!str) return '';
  // Remove characters that are NOT letters (\p{L}), numbers (\p{N}),
  // whitespace (\s), hyphen (-), or apostrophe (').
  // The 'u' flag enables Unicode property escapes (\p).
  // The 'g' flag ensures all occurrences are replaced.
  return str.replace(/[^\p{L}\p{N}\s'-]/gu, '').trim();
}

// GET /api/recipes?search=...
router.get('/', authenticateToken, async (req, res) => {
  const searchQuery = req.query.search;
  if (!searchQuery) {
    return res.status(400).json({ error: 'Search query required' });
  }
  try {
    const recipes = await Recipe.find({ name: { $regex: searchQuery, $options: 'i' } })
      .limit(5);
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/recipes/:id
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/recipes (Add new recipe)
router.post('/', authenticateToken, async (req, res) => {
  // Use 'let' as we will modify 'name'
  let { name } = req.body;

  if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Valid recipe name required' });
  }

  // --- **PROCESS RECIPE NAME START** ---
  name = sanitizeString(name); // Sanitize first
  name = toTitleCase(name);   // Then format

  // Check if the name is valid after processing
  if (!name) {
      return res.status(400).json({ error: 'Recipe name is invalid after processing.' });
  }
  // --- **PROCESS RECIPE NAME END** ---


  try {
    // Use the PROCESSED 'name' in the prompt for consistency
    const prompt = `Generate ingredients for 8 servings of ${name} in this EXACT format:
[{'name':'ingredient1','quantity':1,'unit':'unit'},{'name':'ingredient2'},...]
Rules:
1. For ingredients like spices (e.g., turmeric, pepper), only include 'name'. No quantity/unit.
2. Use metric units (grams, ml, liters, etc.) where applicable for quantities.
3. Return ONLY a valid JSON array string.
4. No introductory text, explanations, or markdown formatting like \`\`\`json. Just the array.
Example for 'Chicken Curry': [{'name':'chicken breast','quantity':500,'unit':'grams'},{'name':'onion','quantity':1,'unit':'unit'},{'name':'garlic cloves','quantity':3,'unit':'unit'},{'name':'ginger','quantity':1,'unit':'piece'},{'name':'coconut milk','quantity':400,'unit':'ml'},{'name':'turmeric'},{'name':'cumin powder'},{'name':'coriander powder'},{'name':'salt'},{'name':'pepper'},{'name':'vegetable oil','quantity':2,'unit':'tablespoons'}]`;


    console.log(`Calling Gemini API for recipe: ${name}`); // Log processed name
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        // Optional safety settings
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    console.log('Raw Response from Gemini API:', JSON.stringify(response.data, null, 2));

    // Error handling for API response (Safety blocks, etc.)
    if (response.data.error) {
        console.error('Gemini API returned an error:', response.data.error);
        let errorMessage = 'Recipe generation failed due to an API error.';
        if (response.data.error.message?.includes('Content is blocked')) {
            errorMessage = 'Recipe generation was blocked by safety filters. Try phrasing the recipe name differently.';
        }
        return res.status(400).json({
            error: errorMessage,
            details: response.data.error.message
        });
    }

    // Check successful response structure
    const candidate = response.data.candidates?.[0];
    if (!candidate || !candidate.content || !candidate.content.parts || !candidate.content.parts[0]?.text) {
      console.error('Unexpected successful response structure from Gemini API:', response.data);
      throw new Error('Received unexpected response structure from the generation API.');
    }

    const generatedText = candidate.content.parts[0].text.trim();
    console.log('Generated Text:', generatedText);

    let parsedIngredients;
    try {
        const jsonString = generatedText
                            .replace(/^```json\s*/, '')
                            .replace(/```$/, '');
        parsedIngredients = JSON.parse(jsonString.replace(/'/g, '"'));
    } catch (parseError) {
      console.error('Error parsing ingredients JSON:', parseError);
      console.error('Received text that failed parsing:', generatedText);
      return res.status(500).json({ error: 'Failed to parse ingredients from API response. The format might be invalid.' });
    }

    if (!Array.isArray(parsedIngredients)) {
        console.error('Parsed ingredients is not an array:', parsedIngredients);
        return res.status(500).json({ error: 'API did not return the ingredients in the expected array format.' });
    }

    // --- **PROCESS INGREDIENTS START** ---
    const processedIngredients = parsedIngredients.map(ing => {
        // Basic check for valid ingredient structure from API
        if (!ing || typeof ing.name !== 'string' || ing.name.trim() === '') {
            return null; // Skip invalid entries from API
        }

        let processedName = sanitizeString(ing.name);
        processedName = toTitleCase(processedName);

        // If name is empty after processing, skip it
        if (!processedName) {
             console.warn(`Skipping ingredient with original name "${ing.name}" as it became empty after processing.`);
             return null;
        }

        return {
            name: processedName, // Use processed name
            quantity: ing.quantity, // Keep original quantity/unit
            unit: ing.unit
        };
    }).filter(ing => ing !== null); // Remove null entries
    // --- **PROCESS INGREDIENTS END** ---


    // Create and save the recipe
    const newRecipe = new Recipe({
      name: name, // Use the processed recipe name
      servings: 8,
      ingredients: processedIngredients // Use the processed ingredients list
    });

    await newRecipe.save();
    console.log(`Saved recipe "${name}" successfully.`);
    res.status(201).json(newRecipe);

  } catch (error) {
    // Catch errors from Axios or other issues
    console.error('Error during recipe generation process:', error);
    if (axios.isAxiosError(error) && error.response) {
        console.error('Axios error data:', error.response.data);
        res.status(error.response.status || 500).json({
           error: 'Failed to communicate with the recipe generation service.',
           details: error.response.data?.error?.message || error.message
        });
    } else {
        res.status(500).json({
           error: 'An internal server error occurred during recipe generation.',
           details: error.message
        });
    }
  }
});

module.exports = router;
