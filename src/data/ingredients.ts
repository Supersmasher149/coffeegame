import type { Ingredient } from "../types/game"

export const ingredients: Ingredient[] = [
  { id: "colombian-beans", name: "Colombian Beans", category: "bean", quality: 2, origin: "Colombia", cost: 2, shelfLife: 14 },
  { id: "ethiopian-beans", name: "Ethiopian Beans", category: "bean", quality: 3, origin: "Ethiopia", cost: 3, shelfLife: 14 },
  { id: "brazilian-beans", name: "Brazilian Beans", category: "bean", quality: 2, origin: "Brazil", cost: 2, shelfLife: 14 },
  { id: "whole-milk", name: "Whole Milk", category: "milk", quality: 1, origin: "Local dairy", cost: 1, shelfLife: 4 },
  { id: "oat-milk", name: "Oat Milk", category: "milk", quality: 2, origin: "Local mill", cost: 2, shelfLife: 7 },
  { id: "almond-milk", name: "Almond Milk", category: "milk", quality: 2, origin: "California", cost: 2, shelfLife: 7 },
  { id: "green-tea", name: "Green Tea", category: "tea", quality: 1, origin: "Shizuoka", cost: 1, shelfLife: 30 },
  { id: "earl-grey", name: "Earl Grey", category: "tea", quality: 2, origin: "Sri Lanka", cost: 2, shelfLife: 30 },
  { id: "chai-blend", name: "Chai Blend", category: "tea", quality: 2, origin: "Kerala", cost: 2, shelfLife: 30 },
  { id: "vanilla", name: "Vanilla Syrup", category: "syrup", quality: 1, origin: "Madagascar", cost: 1, shelfLife: 20 },
  { id: "caramel", name: "Caramel Syrup", category: "syrup", quality: 1, origin: "House made", cost: 1, shelfLife: 20 },
  { id: "lavender", name: "Lavender Syrup", category: "syrup", quality: 3, origin: "Provence", cost: 3, shelfLife: 12, seasonal: "spring" },
  { id: "pumpkin-spice", name: "Pumpkin Spice", category: "syrup", quality: 3, origin: "Harvest farm", cost: 3, shelfLife: 12, seasonal: "autumn" },
  { id: "cocoa", name: "Cocoa Powder", category: "chocolate", quality: 1, origin: "Ghana", cost: 1, shelfLife: 30 },
  { id: "dark-chocolate", name: "Dark Chocolate", category: "chocolate", quality: 2, origin: "Ecuador", cost: 2, shelfLife: 30 },
  { id: "whipped-cream", name: "Whipped Cream", category: "topping", quality: 1, origin: "Local dairy", cost: 1, shelfLife: 3 },
  { id: "cinnamon", name: "Cinnamon", category: "topping", quality: 1, origin: "Sri Lanka", cost: 1, shelfLife: 40 },
  { id: "chocolate-shavings", name: "Chocolate Shavings", category: "topping", quality: 1, origin: "House made", cost: 1, shelfLife: 20 },
]

export const ingredientById = Object.fromEntries(ingredients.map((ingredient) => [ingredient.id, ingredient]))
