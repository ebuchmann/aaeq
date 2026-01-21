import * as fs from 'fs'
import * as path from 'path'

const filePath = path.resolve(__dirname, 'Equipment_Log.txt')

let equipmentLog: string = ''

const parseEquipmentLog = (log: string): Record<string, any>[] => {
  const lines = log.split('\n')
  const equipmentData: Record<string, any>[] = []

  lines.forEach((line) => {
    const match = line.match(/(?<name>.+?)\s+(?<levelKey>level|total levels):\s*(?<level>\d+)/i)
    const cleanName = match?.groups?.name.match(/\* (?<name>.*),/)?.groups?.name.trim()

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

      const damageTypeMatch = line.match(/Damage Type:\s*(?<damageTypes>[\w\s]+?),/i)
      if (damageTypeMatch && damageTypeMatch.groups) {
        const damageTypes = damageTypeMatch.groups.damageTypes.split(' ').map((type) => type.trim())
        equipmentItem.damageTypes = damageTypes
      }

      const wieldStrengthMatch = line.match(/(?<wieldStrength>\d+)\s+wield\s+strength/i)
      if (wieldStrengthMatch && wieldStrengthMatch.groups) {
        equipmentItem.wieldStrength = parseInt(wieldStrengthMatch.groups.wieldStrength, 10)
      }

      const wornMatch = line.match(
        /(?<slots>HEAD|NECK|ARMS|WRISTS|HANDS|FINGERS|ON_BODY|ABOUT_BODY|WAIST|LEGS|FEET|HELD|SHIELD(?!_)|2_WIELD)/g
      )
      if (wornMatch && wornMatch.length > 0) {
        equipmentItem.worn = wornMatch
      } else {
        equipmentItem.worn = ['1_WIELD']
      }

      const alignmentMatch = line.match(/(?<alignments>GOOD|NEUTRAL|EVIL|ANTI_GOOD|ANTI_NEUTRAL|ANTI_EVIL)/g)
      if (alignmentMatch) {
        equipmentItem.alignment = alignmentMatch
      }

      const compositionMatch = line.match(/Comp:\s*(?<composition>(?!Weight)[\w\s,]+)/i)
      if (compositionMatch && compositionMatch.groups) {
        const compositions = compositionMatch.groups.composition.split(',').map((comp) => comp.trim())
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

      const flagsMatch = line.match(/(?<flags>FLOATING|ARTIFACT|GLOW|RARE|JUNK|QUEST_ITEM)/g)
      if (flagsMatch) {
        equipmentItem.flags = flagsMatch
      }

      const classMatch = line.match(/(?<classes>WARRIOR(?!_)|THIEF(?!_)|CLERIC(?!_)|MAGE(?!_)|NECR(?!_)|DRUID(?!_))/g)
      if (classMatch) {
        equipmentItem.classes = classMatch
      }

      const statMatchRegex =
        /(?<statKey>LUCK|STR|DEX|CON|WIS|INT|CHR|CAST_ABILITY|ATTACK_SPEED|DAMROLL|HITROLL|ARMOR|PARRY|DODGE|AGE|MANA|MANA_REGEN|HP_REGEN|MOVE|MOV_REGEN|CLER_CAST_LEVEL|DRUID_CAST_LEVEL|THIEF_SKILL_LEVEL|MAGE_CAST_LEVEL|NECR_CAST_LEVEL|WARR_SKILL_LEVEL|ABSORB_FIRE|ABSORB_ICE|ABSORB_ZAP|ABSORB_MAGIC)\s+by\s+(?:minus\s+)?(?<statValue>-?\d+)/gi
      const statsMatch = line.match(statMatchRegex)
      if (statsMatch) {
        statsMatch.forEach((stat) => {
          const statParts = stat.split(/\s+by\s+/)
          const statKey = statParts[0].trim()
          const statValue = statParts[1].replace('minus', '').trim()
          const statNumber = parseInt(statValue, 10) * (statParts[1].includes('minus') ? -1 : 1)
          equipmentItem.stats[statKey] = statNumber
          equipmentItem.stats[statParts[0]] = statNumber
        })
      }

      equipmentData.push(equipmentItem)
    }
  })

  return equipmentData
}

const equipmentData = [] // parseEquipmentLog(equipmentLog)

const outputFilePath = path.resolve(__dirname, 'src', 'data', 'equipment.json')

const parseThiefFile = (filePath: string): Record<string, any>[] => {
  const thiefData: Record<string, any>[] = []
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const parsedData: any[][] = JSON.parse(JSON.parse(fileContent))

    parsedData.forEach((entry) => {
      const [classes, worn, name, level1, level2, flags, weight, ac, ...stats] = entry
      if (equipmentData.find((item) => item.name.toLowerCase() === name.toLowerCase())) {
        return // Skip if the item already exists in the equipmentItems array
      }
      const equipmentItem: Record<string, any> = {
        name: name.trim(),
        classLevel: parseInt(level1, 10),
        totalLevel: parseInt(level2, 10),
        level: Math.max(parseInt(level1, 10), parseInt(level2, 10)),
        stats: {},
      }

      if (classes) {
        equipmentItem.classes = classes.split(',').map((cls) => cls.trim())
      }

      if (worn) {
        equipmentItem.worn = worn.split(',').map((slot) => slot.trim())
      }

      if (flags) {
        equipmentItem.flags = flags.split(',').map((flag) => flag.trim())
      }

      if (weight) {
        const weightMatch = weight.match(/Weight:\s*(\d+)/i)
        if (weightMatch && weightMatch[1]) {
          equipmentItem.weight = parseInt(weightMatch[1], 10)
        }
      }

      if (ac) {
        equipmentItem.ac = parseInt(ac, 10)
      }

      stats.forEach((stat) => {
        const [statKey, statValue] = stat.split(' by ')
        if (statKey && statValue) {
          const cleanValue = statValue.replace('minus', '').trim()
          equipmentItem.stats[statKey.trim()] = parseFloat(cleanValue) * (statValue.includes('minus') ? -1 : 1)
        }
      })

      const dropSourceMatch = stats.filter((stat) => /^(quest reward|mob|room|container|shop|built)/i.test(stat))
      if (dropSourceMatch.length > 0) {
        equipmentItem.dropSources = dropSourceMatch
          .flatMap((source) => source.match(/(?:quest reward|mob|room|container|shop|built).*/gi))
          .map((source) => source.trim())
          .filter((source) => source.length > 0)
      }

      thiefData.push(equipmentItem)
    })
  } catch (error) {
    console.error('Error reading or parsing thief.txt:', error)
  }

  return thiefData
}

const dataFiles = [
  'data/cleric.txt',
  'data/druid.txt',
  'data/thief.txt',
  'data/mage.txt',
  'data/necro.txt',
  'data/warrior.txt',
]

dataFiles.forEach((file) => {
  const filePath = path.resolve(__dirname, file)
  const data = parseThiefFile(filePath)
  equipmentData.push(...data)
})

try {
  fs.writeFileSync(outputFilePath, JSON.stringify(equipmentData, null, 2), 'utf-8')
  console.log('Equipment data successfully written to Equipment_Data.json')
} catch (error) {
  console.error('Error writing the JSON file:', error)
}

export { equipmentLog, equipmentData }

// try {
//   equipmentLog = fs.readFileSync(filePath, 'utf-8')
//   console.log('File successfully loaded.')
//   const filedata = parseEquipmentLog(equipmentLog)
//   console.log(filedata.length)
// } catch (error) {
//   console.error('Error reading the file:', error)
// }
