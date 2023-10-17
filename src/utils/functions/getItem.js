import axios from "axios";

export default async function getItem(item) {
    const url = 'https://csgobackpack.net/api/GetItemsList/v2/'
    return await axios.get(url)
        .then(response => {
            const jsonData = response.data;

            if (jsonData.items_list && jsonData.items_list[item]) {
                const itemInfo = jsonData.items_list[item];

                const desiredResponse = {
                    success: true,
                    currency: jsonData.currency,
                    timestamp: jsonData.timestamp,
                    items_list: {
                        [item]: itemInfo
                    }
                };

                return desiredResponse.items_list[`${item}`]
            } else {
                console.error(`Item "${item}" not found in the response.`);
                return null
            }
        }).catch(err => { console.log(err) })
}

// `https://steamcommunity-a.akamaihd.net/economy/image/${URL}`

//son 7 günün median price