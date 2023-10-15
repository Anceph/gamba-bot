import axios from "axios";

export default async function getItem(item) {
    const endpoint = encodeURI(`http://csgobackpack.net/api/GetItemPrice/?currency=USD&id=${item}&time=7&icon=1`)
    try {
        const response = await axios.get(endpoint);
        return response.data;
    } catch (error) {
        throw error;
    }
}