const mongoose = require('mongoose');

const IngredientSchema = new mongoose.Schema({
  name: String,
  quantity: Number, // You can use a Number or String depending on your units
  unit: String
});

const RecipeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ingredients: [IngredientSchema]
});

module.exports = mongoose.model('Recipe', RecipeSchema);
