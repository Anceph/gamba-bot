import axios from "axios";

export default async function getPrice(item) {
    const url = 'https://anceph.github.io/naber/prices_v6.json'
    return await axios.get(url)
        .then(function (response) {
            const jsonData = response.data;
            const itemData = jsonData[`${item}`];
            
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