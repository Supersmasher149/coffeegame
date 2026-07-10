import type { Recipe } from "../types/game"

const beans = { ingredientId: "colombian-beans", quantity: 1 }
const milk = { ingredientId: "whole-milk", quantity: 1 }

export const recipes: Recipe[] = [
  { id: "espresso", name: "Espresso", category: "espresso", description: "A small, bright shot with a cap of crema.", ingredients: [beans], minigames: ["espresso"], basePrice: 3, reputationGain: 1, unlockLevel: 1, difficulty: 1, tags: ["hot", "strong"] },
  { id: "americano", name: "Americano", category: "espresso", description: "Espresso softened with clear hot water.", ingredients: [beans], minigames: ["espresso"], basePrice: 4, reputationGain: 1, unlockLevel: 1, difficulty: 1, tags: ["hot", "strong"] },
  { id: "latte", name: "Latte", category: "milk", description: "Silky milk, mellow espresso, and a tiny heart.", ingredients: [beans, milk], minigames: ["espresso", "milk", "latteArt"], basePrice: 5, reputationGain: 2, unlockLevel: 1, difficulty: 2, tags: ["hot", "art"] },
  { id: "cappuccino", name: "Cappuccino", category: "milk", description: "Equal parts espresso, warm milk, and cloudlike foam.", ingredients: [beans, milk], minigames: ["espresso", "milk"], basePrice: 5, reputationGain: 2, unlockLevel: 1, difficulty: 2, tags: ["hot", "foamy"] },
  { id: "flat-white", name: "Flat White", category: "milk", description: "A velvet-smooth cup with a bold coffee center.", ingredients: [beans, milk], minigames: ["espresso", "milk"], basePrice: 6, reputationGain: 2, unlockLevel: 2, difficulty: 2, tags: ["hot", "strong"] },
  { id: "mocha", name: "Mocha", category: "milk", description: "Dark chocolate folded into espresso and steamed milk.", ingredients: [beans, milk, { ingredientId: "cocoa", quantity: 1 }], minigames: ["espresso", "milk", "cold"], assemblyOrder: ["cocoa", "espresso", "milk"], basePrice: 7, reputationGain: 3, unlockLevel: 3, difficulty: 3, tags: ["hot", "sweet"] },
  { id: "macchiato", name: "Macchiato", category: "espresso", description: "Espresso marked with a spoonful of milk foam.", ingredients: [beans, milk], minigames: ["espresso", "milk"], basePrice: 6, reputationGain: 2, unlockLevel: 3, difficulty: 2, tags: ["hot", "strong"] },
  { id: "cold-brew", name: "Cold Brew", category: "cold", description: "Slow-steeped coffee poured over ringing ice.", ingredients: [beans, { ingredientId: "vanilla", quantity: 1 }], minigames: ["grind", "cold"], assemblyOrder: ["ice", "coffee", "vanilla"], basePrice: 6, reputationGain: 2, unlockLevel: 3, difficulty: 2, tags: ["cold", "strong"] },
  { id: "hot-chocolate", name: "Hot Chocolate", category: "milk", description: "A deep cocoa hug under a cap of cream.", ingredients: [milk, { ingredientId: "cocoa", quantity: 1 }], minigames: ["milk", "cold"], assemblyOrder: ["cocoa", "milk", "cream"], basePrice: 5, reputationGain: 1, unlockLevel: 1, difficulty: 1, tags: ["hot", "sweet"] },
  { id: "green-tea", name: "Green Tea", category: "tea", description: "Clean, grassy tea brewed gently and served warm.", ingredients: [{ ingredientId: "green-tea", quantity: 1 }], minigames: ["tea"], basePrice: 4, reputationGain: 1, unlockLevel: 1, difficulty: 1, tags: ["hot", "tea"] },
  { id: "chai-latte", name: "Chai Latte", category: "tea", description: "Spiced black tea swirled with creamy steamed milk.", ingredients: [{ ingredientId: "chai-blend", quantity: 1 }, milk], minigames: ["tea", "milk"], basePrice: 7, reputationGain: 3, unlockLevel: 4, difficulty: 2, tags: ["hot", "spiced"] },
  { id: "iced-latte", name: "Iced Latte", category: "cold", description: "Espresso, cold milk, and ice in lazy marbled layers.", ingredients: [beans, milk], minigames: ["espresso", "cold"], assemblyOrder: ["ice", "milk", "espresso"], basePrice: 6, reputationGain: 2, unlockLevel: 4, difficulty: 2, tags: ["cold", "milk"] },
  { id: "grandmas-hot-chocolate", name: "Grandma's Hot Chocolate", category: "special", description: "Rose's cocoa recipe, warmed with cinnamon and a generous memory.", ingredients: [milk, { ingredientId: "cocoa", quantity: 1 }, { ingredientId: "cinnamon", quantity: 1 }], minigames: ["milk", "cold"], assemblyOrder: ["cocoa", "cinnamon", "milk"], basePrice: 7, reputationGain: 3, unlockLevel: 99, difficulty: 2, tags: ["hot", "sweet", "secret"] },
]

export const recipeById = Object.fromEntries(recipes.map((recipe) => [recipe.id, recipe]))

export const getUnlockedRecipes = (level: number) => recipes.filter((recipe) => recipe.unlockLevel <= level)
