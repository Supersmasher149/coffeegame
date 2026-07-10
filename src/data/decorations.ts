import type { DecorationDefinition } from "../types/game"

export const decorations: DecorationDefinition[] = [
  { id: "wooden-table", name: "Wooden Table", category: "furniture", icon: "table", size: { width: 2, height: 2 }, placement: "floor", effects: [{ type: "seating", value: 1 }], cost: 20, unlockLevel: 1, style: "honey oak" },
  { id: "cozy-armchair", name: "Cozy Armchair", category: "furniture", icon: "armchair", size: { width: 2, height: 2 }, placement: "floor", effects: [{ type: "patience", value: 0.08 }], cost: 30, unlockLevel: 1, style: "berry velvet" },
  { id: "counter-stool", name: "Counter Stool", category: "furniture", icon: "stool", size: { width: 1, height: 1 }, placement: "floor", effects: [{ type: "seating", value: 1 }], cost: 15, unlockLevel: 1, style: "walnut" },
  { id: "bookshelf", name: "Bookshelf", category: "furniture", icon: "books", size: { width: 2, height: 1 }, placement: "floor", effects: [{ type: "attract", value: 0.1 }], cost: 40, unlockLevel: 1, style: "vintage" },
  { id: "plant-pot", name: "Plant Pot", category: "plant", icon: "plant", size: { width: 1, height: 1 }, placement: "floor", effects: [{ type: "patience", value: 0.05 }], cost: 10, unlockLevel: 1, style: "terracotta" },
  { id: "large-plant", name: "Large Plant", category: "plant", icon: "large-plant", size: { width: 2, height: 2 }, placement: "floor", effects: [{ type: "patience", value: 0.1 }], cost: 25, unlockLevel: 2, style: "leafy" },
  { id: "floor-lamp", name: "Floor Lamp", category: "lighting", icon: "lamp", size: { width: 1, height: 1 }, placement: "floor", effects: [{ type: "cozy", value: 0.08 }], cost: 20, unlockLevel: 1, style: "warm brass" },
  { id: "pendant-light", name: "Pendant Light", category: "lighting", icon: "pendant", size: { width: 1, height: 1 }, placement: "wall", effects: [{ type: "tips", value: 0.05 }], cost: 30, unlockLevel: 2, style: "opal glass" },
  { id: "wall-clock", name: "Wall Clock", category: "wall", icon: "clock", size: { width: 1, height: 1 }, placement: "wall", effects: [{ type: "tips", value: 0.02 }], cost: 15, unlockLevel: 1, style: "cream enamel" },
  { id: "framed-art", name: "Framed Art", category: "wall", icon: "art", size: { width: 2, height: 1 }, placement: "wall", effects: [{ type: "attract", value: 0.1 }], cost: 25, unlockLevel: 2, style: "local abstract" },
  { id: "window-box", name: "Window Box", category: "wall", icon: "flowers", size: { width: 2, height: 1 }, placement: "wall", effects: [{ type: "cozy", value: 0.05 }], cost: 20, unlockLevel: 2, style: "wildflowers" },
  { id: "coffee-display", name: "Coffee Display", category: "furniture", icon: "coffee", size: { width: 2, height: 1 }, placement: "floor", effects: [{ type: "reputation", value: 0.05 }], cost: 35, unlockLevel: 3, style: "apothecary" },
  { id: "cat-bed", name: "Cat Bed", category: "cat", icon: "cat-bed", size: { width: 1, height: 1 }, placement: "floor", effects: [{ type: "catHappiness", value: 20 }], cost: 15, unlockLevel: 1, style: "knitted" },
  { id: "cat-tree", name: "Cat Tree", category: "cat", icon: "cat-tree", size: { width: 2, height: 2 }, placement: "floor", effects: [{ type: "catHappiness", value: 15 }], cost: 30, unlockLevel: 2, style: "birch" },
  { id: "scratching-post", name: "Scratching Post", category: "cat", icon: "scratch", size: { width: 1, height: 1 }, placement: "floor", effects: [{ type: "catHappiness", value: 10 }], cost: 20, unlockLevel: 1, style: "sisal" },
  { id: "window-perch", name: "Cat Window Perch", category: "cat", icon: "perch", size: { width: 2, height: 1 }, placement: "wall", effects: [{ type: "catHappiness", value: 10 }], cost: 25, unlockLevel: 2, style: "canvas" },
]

export const decorationById = Object.fromEntries(decorations.map((decoration) => [decoration.id, decoration]))
