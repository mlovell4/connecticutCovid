import Config from "../Config"

export const fetchUsWideDaily = () => {
    let url = "/us-data/v1/us/daily.json"
    return fetch(url, {method:"GET"})
        .then((response)=>response.json())
}
