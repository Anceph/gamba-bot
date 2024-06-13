import axios from "axios";

export default async function getItem(item) {
    const url = 'https://csroi.com/pricing.json';
    let searchItem = item.replace("♥", `\u2665`);
    
    try {
        const response = await axios.get(url);
        const jsonData = response.data;

        if (jsonData[searchItem]) {
            const itemInfo = jsonData[searchItem];

            const desiredResponse = {
                success: true,
                items_list: {
                    [searchItem]: itemInfo
                }
            };

            return desiredResponse.items_list[`${searchItem}`];
        } else {
            return null;
        }
    } catch (err) {
        console.log(err);
        return null;
    }
}

// eski
// export default async function getItem(item) {
//     const url = 'https://csgobackpack.net/api/GetItemsList/v2/'
//     let tempName = item.replace("♥", `\u2665`);
//     const searchItem = tempName.replace("'", '&#39');
//     return await axios.get(url)
//         .then(response => {
//             const jsonData = response.data;

//             if (jsonData.items_list && jsonData.items_list[searchItem]) {
//                 const itemInfo = jsonData.items_list[searchItem];

//                 const desiredResponse = {
//                     success: true,
//                     currency: jsonData.currency,
//                     timestamp: jsonData.timestamp,
//                     items_list: {
//                         [searchItem]: itemInfo
//                     }
//                 };

//                 return desiredResponse.items_list[`${searchItem}`]
//             } else {
//                 return null
//             }
//         }).catch(err => { console.log(err) })
// }

// `https://steamcommunity-a.akamaihd.net/economy/image/${URL}`

//son 7 günün median price