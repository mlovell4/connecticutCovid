import { useEffect, useState } from 'react';
import { calcDateRange, fetchTownAggregateHistory, mostRecentGoodDate } from '../api/ConnecticutApi';
import { useHistory } from "react-router-dom";
import Navbar from './Navbar';
import { Loading } from './Loading';

function TownRow({ix, town, selectTown, last14Days, favorites, toggleFavorite}) {
    const icon = favorites[town.town_no]?"fa fa-star":"fa fa-star-o";
    return <tr key={town.town_no}>
        <td className="nowrap">
            <button onClick={(e)=>toggleFavorite(town)} className="fav-button" title="Toggle Favorite"><i className={icon}/></button>
            {ix + 1}
        </td>
        <td>
            <button onClick={(e)=>selectTown(town.town_no)} className="btn details-button" title="View Graphs">
                <i className="fa fa-area-chart" /> {town.town}
            </button>
        </td>
        <td>
            {town.pop}
        </td>
        <td>
            {town.towntotalcases}
        </td>
        <td>
            {town.towncaserate}
        </td>
        <td>
            {last14Days.totalcases}
        </td>
        <td>
            {!isNaN(last14Days.totaltests) ? last14Days.totaltests : "unknown"}
        </td>
        <td> 
            {last14Days.caserate}
        </td>
        <td> 
            {!isNaN(last14Days.testrate) ? last14Days.testrate : "unknown"}
        </td>
        <td>
            {last14Days.casesweek1 < last14Days.casesweek2 ? <i className="trendup fa fa-arrow-circle-up"/> : <i className="trenddown fa fa-arrow-circle-down"/>}
        </td>
        <td title={last14Days.week1}>
            {last14Days.casesweek1}
        </td>
        <td title={last14Days.week2}>
            {last14Days.casesweek2}
        </td>
    </tr>
}


function TownFullData({townListState, setTownListState}) {
    const [townList, setTownList] = useState(null);
    const [last14DayMap, setLast14DayMap] = useState(null);
    const [twoWeekRange, setTwoWeekRange] = useState(calcDateRange(mostRecentGoodDate()));
    const [calculatedPopulations, setCalculatedPopulations] = useState(null);
    const history = useHistory();

    const favorites = townListState.favorites || {};
    const setFavorites = (favorites) => {
        setTownListState({...townListState , favorites});
    }

    const sortField = townListState.sortField || {column:"town", numeric:false, twoWeek:false, desc:false};
    const setSortField = (sortField) => {
        setTownListState({...townListState , sortField});
    }

    const selectTown = (town_no) => {
        history.push(`/town/${town_no}`)
    }

    useEffect(()=>{
        fetchTownAggregateHistory(twoWeekRange).then((json)=>{
            let data = {};
            json.forEach((town_day)=> {
                let town_data = data[town_day.town_no];
                if (!town_data) {
                    town_data = {days:[]}
                    data[town_day.town_no] = town_data;
                }
                town_data["days"].push(town_day);
            });
            let towns = [];
            let populations = calculatedPopulations || {isNew:true};
            Object.keys(data).forEach((town_no)=>{
                let town_data = data[town_no];
                town_data.days.sort((a,b)=>{
                    if (a.lastupdatedate > b.lastupdatedate) return 1;
                    if (a.lastupdatedate < b.lastupdatedate) return -1;
                    return 0;
                });
                let maxDay = town_data.days[town_data.days.length-1];
                let minDay = town_data.days[0];
                let midPoint = Math.trunc(town_data.days.length / 2);
                town_data.midPoint = town_data.days[midPoint].lastupdatedate;
                town_data.casesweek1 = town_data.days[midPoint].towntotalcases - minDay.towntotalcases;
                town_data.week1 = new Date(minDay.lastupdatedate).toDateString() + " - " + new Date(town_data.days[midPoint].lastupdatedate).toDateString();
                town_data.casesweek2 = maxDay.towntotalcases - town_data.days[midPoint].towntotalcases;
                town_data.week2 = new Date(town_data.days[midPoint].lastupdatedate).toDateString() + " - " + new Date(maxDay.lastupdatedate).toDateString();
                town_data.trend = town_data.casesweek2 - town_data.casesweek1;
                town_data.reportperiodstartdate = minDay.lastupdatedate;
                town_data.reportperiodenddate = maxDay.lastupdatedate;
                if (!populations.isNew) {
                    town_data.pop = populations[town_no];
                } else {
                    town_data.pop = Math.trunc(maxDay.towntotalcases / maxDay.towncaserate * 100000);
                    populations[town_no] = town_data.pop;
                }
                town_data.totaltests = maxDay.numberoftests - minDay.numberoftests;
                town_data.dayCount = Math.trunc((new Date(maxDay.lastupdatedate).getTime() - new Date(minDay.lastupdatedate).getTime()) / (1000 * 3600 * 24)); 
                town_data.testrate = Math.trunc(town_data.totaltests / town_data.pop * 100000 / town_data.dayCount);
                town_data.totalcases = maxDay.towntotalcases - minDay.towntotalcases;
                town_data.caserate = Math.trunc(town_data.totalcases / town_data.pop * 100000 / town_data.dayCount);
                maxDay.pop = town_data.pop;
                towns.push(maxDay);
            });
            setLast14DayMap(data);
            setTownList(towns);
            if (populations.isNew) {
                populations.isNew = false;
                setCalculatedPopulations(populations);
            }
        });
    }, [twoWeekRange,calculatedPopulations])

    const handleSortBy = (column, numeric, twoWeek, desc) => {
        desc = (sortField && sortField.column === column) && (sortField && !sortField.desc);
        setSortField({column, numeric, twoWeek, desc});
    }

    const sortTowns = (townList, column, numeric, twoWeek, desc) => {
        return townList.slice().sort((a,b)=>{
            if (twoWeek) {
                a = last14DayMap[a.town_no];
                b = last14DayMap[b.town_no];
            }
            a = a[column];
            b = b[column];
            if (numeric) {
                const aa = a;
                a = parseFloat(b);
                b = parseFloat(aa);
            }
            if (a > b) return desc?-1:1;
            if (b > a) return desc?1:-1;
            return 0;
        }).map((town, ix)=>{town.ix=ix;return town});
    }

    const changeDate = (change) => {
        const max = new Date(twoWeekRange.end);
        max.setDate( max.getDate() + change );
        if (change > 0) {
            while(max.getDay()>4) {
                max.setDate(max.getDate()+1);
            }
        }
        setTwoWeekRange(calcDateRange(max, change>0?1:-1));
    }

    const handleReset = () => {
        setTwoWeekRange(calcDateRange(new Date(),-1));
    }

    const toggleFavorite = (favoriteTown) => {
        const newFavorites = Object.assign({}, favorites);
        newFavorites[favoriteTown.town_no] =  !(!!newFavorites[favoriteTown.town_no])
        setFavorites(newFavorites);
    }

    if (!townList || !last14DayMap) {
        return <Loading>Loading...</Loading>
    }

    let sortedTownList = sortTowns(townList, sortField.column, sortField.numeric, sortField.twoWeek, sortField.desc)
  
    return (
      <div className="">
          <Navbar pageName="Town Details Table"/>
          <table className="table table-bordered table-dark town-detail-list">
            <thead className="thead-dark">
                <tr className="head-groups">
                    <th scope="colgroup" colSpan="5">
                        Overall
                        <div>Through {twoWeekRange.end.toDateString()}</div>
                    </th>
                    <th scope="colgroup" colSpan="7">
                        2 Weeks Period
                        <button className="date-btn" onClick={handleReset}><i className="fa fa-refresh" /></button>
                        <div>
                            <button title="Back One Week" className="date-btn date-back" onClick={()=>changeDate(-7)}><i className="fa fa-angle-double-left" /></button>
                            <button title="Back One Day" className="date-btn date-back" onClick={()=>changeDate(-1)}><i className="fa fa-angle-left" /></button>
                            {twoWeekRange.start.toDateString()} - 
                            {twoWeekRange.end.toDateString()}
                            <button title="Forward One Day" className="date-btn date-next" onClick={()=>changeDate(7)}><i className="fa fa-angle-double-right" /></button>
                            <button title="Forward One Week" className="date-btn date-next" onClick={()=>changeDate(1)}><i className="fa fa-angle-right" /></button>
                        </div>

                    </th>
                </tr>
                <tr>
                    <th scope="col">#</th>
                    <th scope="col" className="pt-c nowrap" onClick={(e)=>handleSortBy("town", false, false)}><i className="fa fa-sort"/> Town</th>
                    <th scope="col" className="pt-c nowrap" onClick={(e)=>handleSortBy("pop", true, true)}><i className="fa fa-sort"/> Population</th>
                    <th scope="col" className="pt-c nowrap" onClick={(e)=>handleSortBy("towntotalcases", true, false)}><i className="fa fa-sort"/> Cases</th>
                    <th scope="col" className="pt-c nowrap" title="Cases / 100k" onClick={(e)=>handleSortBy("towncaserate", true, false)}><i className="fa fa-sort"/> Case rate</th>
                    <th scope="col" className="pt-c nowrap" onClick={(e)=>handleSortBy("totalcases", true, true)}><i className="fa fa-sort"/> Cases</th>
                    <th scope="col" className="pt-c nowrap" onClick={(e)=>handleSortBy("totaltests", true, true)}><i className="fa fa-sort"/> Tests</th>
                    <th scope="col" className="pt-c nowrap" title="Daily Case Rate / 100k" onClick={(e)=>handleSortBy("caserate", true, true)}><i className="fa fa-sort"/> Case rate</th>
                    <th scope="col" className="pt-c nowrap" title="Daily Test Rate / 100k" onClick={(e)=>handleSortBy("testrate", true, true)}><i className="fa fa-sort"/> Test rate</th>
                    <th scope="col" className="pt-c nowrap" onClick={(e)=>handleSortBy("trend", true, true)}><i className="fa fa-sort"/> Trend</th>
                    <th scope="col" className="pt-c nowrap" onClick={(e)=>handleSortBy("casesweek1", true, true)}><i className="fa fa-sort"/> 1st Half</th>
                    <th scope="col" className="pt-c nowrap" onClick={(e)=>handleSortBy("casesweek2", true, true)}><i className="fa fa-sort"/> 2nd Half</th>
                </tr>
                {sortedTownList.filter((town)=>favorites[town.town_no]).map((town)=>{
                    const last14Days = last14DayMap && last14DayMap[town.town_no];
                    return <TownRow town={town} ix={sortedTownList.indexOf(town)} selectTown={selectTown} last14Days={last14Days} toggleFavorite={toggleFavorite} favorites={favorites}/>

                })}
            </thead>
            <tbody>
            {sortedTownList.filter((town)=>!favorites[town.town_no]).map((town, ix)=>{
                const last14Days = last14DayMap && last14DayMap[town.town_no];
                return <TownRow key={ix} town={town} selectTown={selectTown} ix={sortedTownList.indexOf(town)} last14Days={last14Days} toggleFavorite={toggleFavorite} favorites={favorites}/>
            })}
            </tbody>
          </table>
      </div>
    );
  }
  
  export default TownFullData;
  