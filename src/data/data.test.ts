import { cats } from "./cats"
import { customers } from "./customers"
import { decorations } from "./decorations"
import { ingredients } from "./ingredients"
import { recipes } from "./recipes"

describe("game data", () => {
  it("contains the complete MVP content", () => {
    expect(recipes).toHaveLength(18)
    expect(ingredients).toHaveLength(18)
    expect(customers).toHaveLength(7)
    expect(cats).toHaveLength(3)
    expect(decorations).toHaveLength(16)
  })

  it("uses unique IDs and valid recipe ingredient references", () => {
    const ingredientIds = new Set(ingredients.map((ingredient) => ingredient.id))
    expect(new Set(recipes.map((recipe) => recipe.id)).size).toBe(recipes.length)
    expect(recipes.every((recipe) => recipe.ingredients.every((item) => ingredientIds.has(item.ingredientId)))).toBe(true)
  })

  it("uses every market ingredient in at least one recipe", () => {
    const usedIngredientIds = new Set(recipes.flatMap((recipe) => recipe.ingredients.map((item) => item.ingredientId)))
    expect(ingredients.every((ingredient) => usedIngredientIds.has(ingredient.id))).toBe(true)
  })
})
