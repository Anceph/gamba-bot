import guilds from "./guilds.js";

export const fetch = async (id) => {
    let db = await guilds.findOne({ guild_id: id })

    if (db) {
        return db
    } else {
        db = new guilds({ id })
        await db.save()
        return db
    }
}

export const fetchAll = async (filter = {}) => {
    const db = await guilds.find(filter)
    return db
}

export const update = async (id, value) => {
    const returned = await guilds.updateOne({ id }, data)

    if (returned.matchedCount == 0) {
        const data = Object.entries(Object.values(value)[0])[0]
        const db = new guilds({
            id,
            [data[0]]: data[1]
        })

        await db.save()
        return db
    }
}

export const deleteOne = async (id) => {
    guilds.deleteOne({ id })
}