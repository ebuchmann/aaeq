import * as fs from 'fs'
import * as path from 'path'

const filePath = path.resolve(__dirname, 'Equipment_Log.txt')

let equipmentLog: string

try {
  equipmentLog = fs.readFileSync(filePath, 'utf-8')
  console.log('File successfully loaded.')
} catch (error) {
  console.error('Error reading the file:', error)
}

const parseEquipmentLog = (log: string): Record<string, any>[] => {
  const lines = log.split('\n')
  const equipmentData: Record<string, any>[] = []

  lines.forEach((line) => {
    const match = line.match(
      /(?<name>.+?)\s+(?<levelKey>level|total levels):\s*(?<level>\d+)/i
    )
    const cleanName = match?.groups?.name
      .match(/\* (?<name>.*),/)
      ?.groups?.name.trim()

    const doesNotExist = !equipmentData.find((item) => item.name === cleanName)

    if (match && match.groups && doesNotExist) {
      const equipmentItem: Record<string, any> = {
        name: cleanName,
        level: parseInt(match.groups.level, 10),
        stats: {},
      }

      const damageMatch = line.match(/Damage:\s*(?<damage>\d+d\d+)/i)
      if (damageMatch && damageMatch.groups) {
        equipmentItem.damage = damageMatch.groups.damage
      }

      const speedMatch = line.match(/Speed:\s*(?<speed>\w+(?:\s+\w+)?)/i)
      if (speedMatch && speedMatch.groups) {
        equipmentItem.speed = speedMatch.groups.speed.trim()
      }

      const damageTypeMatch = line.match(
        /Damage Type:\s*(?<damageTypes>[\w\s]+?),/i
      )
      if (damageTypeMatch && damageTypeMatch.groups) {
        const damageTypes = damageTypeMatch.groups.damageTypes
          .split(' ')
          .map((type) => type.trim())
        equipmentItem.damageTypes = damageTypes
      }

      const wieldStrengthMatch = line.match(
        /(?<wieldStrength>\d+)\s+wield\s+strength/i
      )
      if (wieldStrengthMatch && wieldStrengthMatch.groups) {
        equipmentItem.wieldStrength = parseInt(
          wieldStrengthMatch.groups.wieldStrength,
          10
        )
      }

      const wornMatch = line.match(
        /(?<slots>HEAD|NECK|ARMS|WRISTS|HANDS|FINGERS|ON_BODY|ABOUT_BODY|WAIST|LEGS|FEET|HELD|SHIELD(?!_)|2_WIELD)/g
      )
      if (wornMatch && wornMatch.length > 0) {
        equipmentItem.worn = wornMatch
      } else {
        equipmentItem.worn = ['1_WIELD']
      }

      const alignmentMatch = line.match(
        /(?<alignments>GOOD|NEUTRAL|EVIL|ANTI_GOOD|ANTI_NEUTRAL|ANTI_EVIL)/g
      )
      if (alignmentMatch) {
        equipmentItem.alignment = alignmentMatch
      }

      const compositionMatch = line.match(
        /Comp:\s*(?<composition>(?!Weight)[\w\s,]+)/i
      )
      if (compositionMatch && compositionMatch.groups) {
        const compositions = compositionMatch.groups.composition
          .split(',')
          .map((comp) => comp.trim())
        equipmentItem.composition = compositions
      }

      const weightMatch = line.match(/Weight:\s*(?<weight>\d+)/i)
      if (weightMatch && weightMatch.groups) {
        const weight = parseInt(weightMatch.groups.weight, 10)
        equipmentItem.weight = weight
      }

      const acMatch = line.match(/AC:\s*(?<ac>\d+)/i)
      if (acMatch && acMatch.groups) {
        equipmentItem.ac = parseInt(acMatch.groups.ac, 10)
      }

      const flagsMatch = line.match(
        /(?<flags>FLOATING|ARTIFACT|GLOW|RARE|JUNK|QUEST_ITEM)/gi
      )
      if (flagsMatch) {
        equipmentItem.flags = flagsMatch
      }

      const classMatch = line.match(
        /(?<classes>WARRIOR(?!_)|THIEF(?!_)|CLERIC(?!_)|MAGE(?!_)|NECR(?!_)|DRUID(?!_))/g
      )
      if (classMatch) {
        equipmentItem.classes = classMatch
      }

      const statMatchRegex =
        /(?<statKey>LUCK|STR|DEX|CON|WIS|INT|CHR|CAST_ABILITY|DAMROLL|HITROLL|ARMOR|PARRY|DODGE|AGE|MANA|MANA_REGEN|HP_REGEN|MOVE|MOV_REGEN|CLER_CAST_LEVEL|DRUID_CAST_LEVEL|THIEF_SKILL_LEVEL|MAGE_CAST_LEVEL|NECR_CAST_LEVEL|WARR_SKILL_LEVEL|ABSORB_FIRE|ABSORB_ICE|ABSORB_ZAP|ABSORB_MAGIC)\s+by\s+(?<statValue>-?\d+)/gi
      const statsMatch = line.match(statMatchRegex)
      if (statsMatch) {
        statsMatch.forEach((stat) => {
          const statParts = stat.split(/\s+by\s+/)
          equipmentItem.stats[statParts[0]] = parseInt(statParts[1], 10)
        })
      }

      equipmentData.push(equipmentItem)
    }
  })

  return equipmentData
}

const equipmentData = parseEquipmentLog(equipmentLog)

const outputFilePath = path.resolve(__dirname, 'Equipment_Data.json')

try {
  fs.writeFileSync(
    outputFilePath,
    JSON.stringify(equipmentData, null, 2),
    'utf-8'
  )
  console.log('Equipment data successfully written to Equipment_Data.json')
} catch (error) {
  console.error('Error writing the JSON file:', error)
}

export { equipmentLog, equipmentData }
