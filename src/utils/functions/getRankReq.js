import ranksData from '../ranks.json' assert { type: "json" }

export default async function getRankReq(rank) {
    const rankReq = Object.values(ranksData.ranks)[rank][0].requirement
    return rankReq
}