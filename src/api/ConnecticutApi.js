import Config from "../Config"

export const fetchTownAggregateHistory = (range) => {
    const baseUrl = Config.dataUrl + Config.aggregateByTown + ".json";
    let url = `${baseUrl}?&$limit=${169 * 14}`
    if (range) {
        let startDate = range.start;
        const start = dateToQueryDate(startDate);
        const end = dateToQueryDate(range.end);
        const where = "lastupdatedate between '"+start+"' and '"+end+"'";
        url = url + `&$where=${where}`;
    }
    return fetch(url, {method:"GET"})
        .then((response)=>response.json())
}

function dateToQueryDate(date) {
    return date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate() + "T00:00:00.000"
}

export const fetchTownAggregateHistoryEndpoint = (range) => {
    const baseUrl = Config.dataUrl + Config.aggregateByTown + ".json";
    let url = `${baseUrl}?&$limit=${169 * 14}`
    if (range) {
        let startDate = new Date(range.start);
        //startDate.setDate(startDate.getDate()-1)
        const start = dateToQueryDate(startDate);   
        const end = dateToQueryDate(range.end);
        const where = "lastupdatedate='"+start+"' OR lastupdatedate='"+end+"'";
        url = url + `&$where=${where}`;
    }
    return fetch(url, {method:"GET"})
        .then((response)=>response.json())
}

export const fetchTownAggregateList = () => {
    const baseUrl = Config.dataUrl + Config.aggregateByTown + ".json";
    let url = `${baseUrl}?&$limit=${169}`
    return fetch(url, {method:"GET"})
        .then((response)=>response.json())
}

export const fetchStateWideAgeGroupDaily = () => {
    const baseUrl = Config.dataUrl + Config.ageGroupState + ".json";
    let url = `${baseUrl}?&$limit=${169*365}`
    return fetch(url, {method:"GET"})
        .then((response)=>response.json())
}

export const fetchTownAggregates = (townNo) => {
    const baseUrl = Config.dataUrl + Config.aggregateByTown + ".json";
    const url = `${baseUrl}?&$limit=1000&town_no=${townNo}`
    return fetch(url, {method:"GET"})
        .then((response)=>response.json())
}

export const fetchStateWideDaily = () => {
    const baseUrl = Config.dataUrl + Config.stateWideDaily + ".json";
    const url = `${baseUrl}?&$limit=1000`
    return fetch(url, {method:"GET"})
        .then((response)=>response.json())
}

export const fetchGeoData = () => {
    const baseUrl = Config.geoJsonUrl;
    const url = `${baseUrl}?`
    return fetch(url, {method:"GET"})
        .then((response)=>response.text())
        .then((text)=>JSON.parse(text))
    
}

export const minEndDate = new Date("2020-04-08");


export function mostRecentGoodDate() {
    const end = new Date();
    end.setDate(end.getDate()-2);
    while (end.getDay()>4) {
        end.setDate(end.getDate()-1);
    }
    return end;
}

export function calcDateRange(end, direction) {
    direction = direction || -1;
    while (end.getDay()>4) {
        end.setDate(end.getDate() + direction);
    }
    if (end < minEndDate) {
        end = minEndDate;
    }
    const mostRecent = mostRecentGoodDate();
    if (end > mostRecent) {
        end = mostRecent;
    }
    end.setHours(0,0,0,0);
    const start = new Date(end);
    start.setDate(end.getDate()-7);
    return {start,end}
}