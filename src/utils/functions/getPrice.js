import axios from "axios";

export default async function getPrice(item) {
    const url = 'http://anceph.xyz/prices_v6.json'
    return await axios.get(url)
        .then(function (response) {
            const jsonData = response.data;
            const itemData = jsonData[`${item}`];
            
            console.log(itemData['buff163'].starting_at)
            return itemData['buff163'].starting_at
        })
        .catch(function (error) {
            if (error.response) {
                console.error("Response data:", error.response.data);
                console.error("Status code:", error.response.status);
            } else if (error.request) {
                console.error("No response received");
            } else {
                console.error("Error setting up the request:", error.message);
            }
        });
}