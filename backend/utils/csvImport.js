require('dotenv').config();
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const Recipe = require('../models/Recipe');

mongoose.connect(process.env.MONGO_URI);

let recipesMap = {};

const csvFilePath = path.join(__dirname, 'grocery_list.csv');

fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on('data', (data) => {
    // Use header keys from the CSV
    const recipeName = data["Dish name"]?.trim();
    
    // Get the quantity as a trimmed string; if empty, set to null
    let quantity = data["Quantity"] ? data["Quantity"].trim() : null;
    quantity = (quantity && !isNaN(quantity)) ? Number(quantity) : null;
    
    const unit = data["Unit of Measure"] ? data["Unit of Measure"].trim() : '';
    const ingredientName = data["Ingredients"]?.trim();

    // Skip if any required fields are missing (optional)
    if (!recipeName || !ingredientName) return;

    if (!recipesMap[recipeName]) {
      recipesMap[recipeName] = { name: recipeName, ingredients: [] };
    }
    recipesMap[recipeName].ingredients.push({ name: ingredientName, quantity, unit });
  })
  .on('end', async () => {
    try {
      for (const recipe of Object.values(recipesMap)) {
        await new Recipe(recipe).save();
      }
      console.log('CSV data imported successfully!');
      mongoose.disconnect();
    } catch (err) {
      console.error(err);
    }
  })
  .on('error', (err) => {
    console.error('Error reading CSV file:', err);
  });
