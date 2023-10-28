import ranksData from '../ranks.json' assert { type: "json" }

export default async function getRankName(rank) {
    const rankName = Object.values(ranksData.ranks)[rank][0].name
    return rankName
}