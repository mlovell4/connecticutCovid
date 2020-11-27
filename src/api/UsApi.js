import Config from "../Config"

export const fetchUsWideDaily = () => {
    let url = "https://api.covidtracking.com/v1/us/daily.json"
    return fetch(url, {method:"GET"})
        .then((response)=>response.json())
}
