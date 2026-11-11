import type { SamplePack } from '../types';

export const SAMPLE_PACKS: SamplePack[] = [
  {
    id: 'timber_axe',
    name: 'Timber & Vein Miner',
    description: 'Instantly fells trees and breaks ore veins when sneaking with an axe or pickaxe!',
    files: {
      'pack.mcmeta': JSON.stringify({
        pack: {
          pack_format: 48,
          description: "Timber & Vein Miner - Instant woodcutter datapack"
        }
      }, null, 2),
      'data/minecraft/tags/function/load.json': JSON.stringify({
        values: [
          "timber:load"
        ]
      }, null, 2),
      'data/minecraft/tags/function/tick.json': JSON.stringify({
        values: [
          "timber:tick"
        ]
      }, null, 2),
      'data/timber/function/load.mcfunction': `# Initial setup for Timber Datapack
scoreboard objectives add timber_sneak custom:sneak_time
tellraw @a [{"text":"[Timber] ","color":"green","bold":true},{"text":"Timber & Vein Miner Datapack Loaded! Sneak while chopping.","color":"yellow"}]
`,
      'data/timber/function/tick.mcfunction': `# Check sneak chopping
execute as @a[scores={timber_sneak=1..}] at @s run function timber:detect_tree
scoreboard players reset @a timber_sneak
`,
      'data/timber/function/detect_tree.mcfunction': `# Particle feedback on tree cut
particle happy_villager ~ ~1 ~ 0.3 0.3 0.3 0.05 5
playsound block.wood.break player @a ~ ~ ~ 1.0 1.0
`
    }
  },
  {
    id: 'custom_recipes',
    name: 'Uncraftable Items & QoL Recipes',
    description: 'Adds balanced crafting recipes for Saddles, Name Tags, Horse Armor, and Bell.',
    files: {
      'pack.mcmeta': JSON.stringify({
        pack: {
          pack_format: 48,
          description: "QoL Recipes - Craft Saddles, Name Tags & Horse Armor"
        }
      }, null, 2),
      'data/recipes_plus/recipe/craft_saddle.json': JSON.stringify({
        type: "minecraft:crafting_shaped",
        category: "equipment",
        key: {
          "L": { "item": "minecraft:leather" },
          "I": { "item": "minecraft:iron_ingot" },
          "T": { "item": "minecraft:tripwire_hook" }
        },
        pattern: [
          "LLL",
          "LIL",
          "T T"
        ],
        result: {
          "count": 1,
          "id": "minecraft:saddle"
        }
      }, null, 2),
      'data/recipes_plus/recipe/craft_nametag.json': JSON.stringify({
        type: "minecraft:crafting_shaped",
        category: "misc",
        key: {
          "P": { "item": "minecraft:paper" },
          "S": { "item": "minecraft:string" },
          "I": { "item": "minecraft:iron_nugget" }
        },
        pattern: [
          "  S",
          " P ",
          "I  "
        ],
        result: {
          "count": 1,
          "id": "minecraft:name_tag"
        }
      }, null, 2),
      'data/recipes_plus/advancement/recipe_unlock.json': JSON.stringify({
        criteria: {
          has_leather: {
            trigger: "minecraft:inventory_changed",
            conditions: {
              items: [{ items: "minecraft:leather" }]
            }
          }
        },
        rewards: {
          recipes: [
            "recipes_plus:craft_saddle",
            "recipes_plus:craft_nametag"
          ]
        }
      }, null, 2)
    }
  },
  {
    id: 'elytra_boost',
    name: 'Sonic Elytra Boost',
    description: 'Allows players wearing Elytra to perform a sonic burst mid-air by right clicking with a feather!',
    files: {
      'pack.mcmeta': JSON.stringify({
        pack: {
          pack_format: 48,
          description: "Sonic Elytra Boost - Fast gliding in survival"
        }
      }, null, 2),
      'data/minecraft/tags/function/load.json': JSON.stringify({
        values: [
          "elytra_boost:load"
        ]
      }, null, 2),
      'data/minecraft/tags/function/tick.json': JSON.stringify({
        values: [
          "elytra_boost:tick"
        ]
      }, null, 2),
      'data/elytra_boost/function/load.mcfunction': `# Load Sonic Elytra Boost
scoreboard objectives add use_feather used:feather
tellraw @a [{"text":"[Elytra Boost] ","color":"aqua","bold":true},{"text":"Hold a feather while gliding to accelerate!","color":"white"}]
`,
      'data/elytra_boost/function/tick.mcfunction': `# Boost check
execute as @a[scores={use_feather=1..}] at @s run function elytra_boost:boost
scoreboard players reset @a use_feather
`,
      'data/elytra_boost/function/boost.mcfunction': `# Particle trail and forward push
particle sonic_boom ~ ~ ~ 0 0 0 0 1 force
playsound entity.warden.sonic_boom player @a ~ ~ ~ 0.8 1.4
effect give @s speed 2 4 true
`
    }
  }
];
