import { cats } from "./cats"
import { customers } from "./customers"
import { decorations } from "./decorations"
import { ingredients } from "./ingredients"
import { recipes } from "./recipes"

describe("game data", () => {
  it("contains the complete MVP content", () => {
    expect(recipes).toHaveLength(13)
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
})
