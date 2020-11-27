import { useEffect } from 'react';
import { fetchTownAggregateList } from '../api/ConnecticutApi';
import { useHistory } from "react-router-dom";
import Navbar from './Navbar';
import { Loading } from './Loading';


function TownRow({ix, town, selectTown}) {
    return <div className="town-row" onClick={(e)=>selectTown(town.town_no)} >
        <button alt="View Details" className="town-details-button link">
            <i className="fa fa-angle-right" />
        </button>
        <div>
            <h3>{town.town}</h3>    
        </div>
        <div>
            Total Cases: {town.towntotalcases}<br />
            Cases per 100K: {town.towncaserate}
        </div>
    </div>
}


function TownList({townList, townListState, setTownListState}) {
    const history = useHistory();

    if (!townList) {
        return <Loading>Loading...</Loading>
    }

    const filterText = townListState.filterText || "";
    const setFilterText = (filterText)=>setTownListState({...townListState, filterText});

    const sortField = townListState.sortField || {column:"town", numeric:false, name: "Name"};
    const setSortField = (sortField)=>setTownListState({...townListState, sortField})

    const selectTown = (town_no) => {
        history.push(`/town/${town_no}`)
    }

    const sortTowns = (townList, column, numeric, desc) => {
        return townList.slice().sort((a,b)=>{
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


    let sortedTownList = sortTowns(townList, sortField.column, sortField.numeric, sortField.desc)
    if (filterText && filterText.length > 0) {
        sortedTownList = sortedTownList.filter((town)=>{
            return town.town.toLowerCase().indexOf(filterText.toLowerCase())>=0;
        })
    }
  
    const handleSortField = (e)=>{
        e.preventDefault();
        let column = e.target.getAttribute("data-column");
        let numeric = e.target.getAttribute("data-numeric") === "true";
        let name = e.target.getAttribute("data-name");
        let desc = e.target.getAttribute("data-desc") === "true";
        setSortField({column,numeric,name,desc})
    }

    return (
      <div className="town-list">
          <div className="toolbar">
            <Navbar pageName="Town List"/>
            <button className="nav-btn dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                <i className="fa fa-sort-amount-desc" /> Sort By {sortField.name}
            </button>
            <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                <a className="dropdown-item" onClick={handleSortField} data-name="Town Name" data-column="town" data-numeric="false" href="./#">Town Name</a>
                <a className="dropdown-item" onClick={handleSortField} data-name="Total Cases" data-column="towntotalcases" data-numeric="true" href="./#">Total Cases</a>
                <a className="dropdown-item" onClick={handleSortField} data-name="Case Rate" data-column="towncaserate" data-numeric="true" href="./#">Case Rate</a>
                <a className="dropdown-item" onClick={handleSortField} data-name="Total Cases Desc" data-desc="true" data-column="towntotalcases" data-numeric="true" href="./#">Total Cases Asc</a>
                <a className="dropdown-item" onClick={handleSortField} data-name="Case Rate Desc"  data-desc="true" data-column="towncaserate" data-numeric="true" href="./#">Case Rate Asc</a>
            </div>
            &nbsp;&nbsp;
            <input type="text" autoFocus placeholder="Filter" value={filterText} onChange={(e)=>setFilterText(e.target.value)} />
            {/* <button className="btn-clear-input" onClick={()=>setFilterText("")}><i className="fa fa-window-close-o"/></button> */}
          </div>
          <div className="towns">
            {sortedTownList.map((town,ix)=>{
                    return <TownRow town={town} ix={ix} selectTown={selectTown} />
                })
            }
          </div>
      </div>
    );
  }
  
  export default TownList;
  