
import { useState } from 'react';
import { Loading } from './Loading';
import Navbar from './Navbar';

function MapView({townList, threeWeekData, geoData, onDateRangeChange}) {

    const [selectedTown, setSelectedTown] = useState(null);
    const [colorType, setColorType] = useState("Caserate");

    const caseRateProperty = "towncaserate";
    const caseTotalProperty = "towntotalcases";

    if (!geoData || !townList || !threeWeekData) {
        return <Loading>Loading...</Loading>
    }

    const pathForTown = (town) => {
        let path = "";
        let first = true;
        town.coordinates.forEach((coord)=>{
            let func = (first ? "M" : "L");
            path += func + multiplier*(xOffset + coord[0]) + "," + (canHeight-multiplier*(yOffset + coord[1])) + "\n";
            first = false;
        });
        return path;
    }
    
    const canWidth = 500;
    const canHeight = 300;
    let multiplierX = canWidth/(geoData.maxX - geoData.minX);
    let multiplierY = canHeight/(geoData.maxY - geoData.minY);
    let multiplier = Math.min(multiplierX, multiplierY);
    let xOffset = -geoData.minX;
    let yOffset = -geoData.minY;
    xOffset += ((canWidth - multiplier * (geoData.maxX - geoData.minX))/multiplier)/2
    yOffset += ((canHeight - multiplier * (geoData.maxY - geoData.minY))/multiplier)/2

    const clickTown = (e,town)=>{
        e.preventDefault();
        setSelectedTown(town);
    }

    let maxChange = 0;
    let rateChangeAverage = 0;
    geoData.townMap.forEach((town)=>{
        let townData = threeWeekData.townDataMap[town.town_no];
        let rateChange = colorType === "Trend" ?
            (townData.days[2][caseRateProperty] - townData.days[1][caseRateProperty]) - (townData.days[1][caseRateProperty] - townData.days[0][caseRateProperty])
            :
            (townData.days[2][caseRateProperty] - townData.days[0][caseRateProperty]);
        maxChange = Math.max(rateChange, maxChange);
        rateChangeAverage += (townData.days[2][caseRateProperty] - townData.days[0][caseRateProperty]);
    });
    rateChangeAverage = rateChangeAverage / geoData.townMap.length;

    const townFill = (town)=> {
        let townData = threeWeekData.townDataMap[town.town_no];
        if (colorType === "Trend") {
            let rateChangeDiff = (townData.days[2][caseRateProperty] - townData.days[1][caseRateProperty]) - (townData.days[1][caseRateProperty] - townData.days[0][caseRateProperty]);
            let r = rateChangeDiff > 0 && Math.trunc(Math.min(205, 205 * (rateChangeDiff / 35))) || 0;
            let g = rateChangeDiff < 0 && Math.trunc(Math.min(205, 205 * (-rateChangeDiff / 35))) || 0;
            let b = Math.trunc(80 - Math.abs(r + g));
            return `RGB(${r},${g},${b})`
        } else if (colorType === "Caserate") {
            let rateChange = townData.days[2][caseRateProperty] - townData.days[0][caseRateProperty];
            let r = rateChange > 30 && Math.trunc(Math.min(245, 245 * (rateChange / maxChange))) || 0;
            let g = rateChange < 30 && Math.trunc(Math.min(245, 150 * ((50 - rateChange) / 50))) || 0;
            let b = 0;//Math.trunc(80 - Math.abs(r + g));
            return `RGB(${r},${g},${b})`
        }
    }

    let selectedTownData = selectedTown && threeWeekData && threeWeekData.townDataMap &&
                        threeWeekData.townDataMap[selectedTown.town_no] || null;
    let selectedTownDays = 0;

    if ( selectedTownData ) {
        selectedTownDays = new Date(selectedTownData.days[2].lastupdatedate).getDaysSince(new Date(selectedTownData.days[0].lastupdatedate))
    }

    const handleColorChange = (e)=>{
        e.preventDefault();
        let name = e.target.getAttribute("data-name");
        setColorType(name);
    }

    const handleDateBack = (e) => {
        e.preventDefault();
        onDateRangeChange(-7);
    }

    const handleDateForward = (e) => {
        e.preventDefault();
        onDateRangeChange(7);
    }

    return (
        <div>
            <Navbar pageName="Connecticut Map"/>
            <div className="toolbar d-none d-md-block">
                <h3>Connecticut Map</h3>
            </div>
            <div className="towns-map">
            <div className="instr">Touch a Town for Details</div>
            <div className="date-range d-flex justify-content-center align-items-center">
                <div className="c1">
                    <button className="date-btn" onClick={handleDateBack} title="Back One Week"><i className="fa fa-angle-double-left" /></button>
                </div>
                <div className="c2">
                    <span>{new Date(threeWeekData.townDataMap["1"].days[0].lastupdatedate).toDateString()}</span>
                    <span>&nbsp;-&nbsp;</span>
                    <span>{new Date(threeWeekData.townDataMap["1"].days[2].lastupdatedate).toDateString()}</span> 
                </div>
                <div className="c1">
                    <button className="date-btn" onClick={handleDateForward} title="Forward One Week"><i className="fa fa-angle-double-right" /></button>
                </div>
            </div>
            <div>
                <h4 className="instr">Case Rate (per 100K)</h4>
                {/* <button className="nav-btn dropdown-toggle" type="button" id="colorDropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <i className="fa fa-palette" /> {colorType==="Trend"?"Week 1 vs Week 2 Trend":"Case Rate (per 100K)"}
                </button>
                <div className="dropdown-menu" aria-labelledby="colorDropdownMenuButton">
                    <a className="dropdown-item" onClick={handleColorChange} data-name="Caserate" href="./#">Case Rate (per 100K)</a>
                    <a className="dropdown-item" onClick={handleColorChange} data-name="Trend" href="./#">Week 1 vs Week 2 Trend</a>
                </div> */}
            </div>


            <svg viewBox={"0 0 " + canWidth + " " + canHeight} className="map-svg">
                {
                    geoData.townMap.map((town,ix) => {
                        return <a href="./#" key={ix} onClick={(e)=>clickTown(e, town)} >
                                <path strokeWidth={1} stroke={"white"}
                                        fill={townFill(town)}
                                        d={pathForTown(town)}/>
                            </a>
                    })
                }
                {selectedTown && <path strokeWidth={3} stroke={"white"} fill={"transparent"}
                        d={pathForTown(selectedTown)}/>}
            </svg>
            {selectedTown && 
                <div className="selected-town mb-5">
                    <h3>{selectedTown.town}</h3>
                    {selectedTownData && <>
                            <div>Population: {selectedTownData.population}</div>
                            {colorType === "Trend" && <>
                            <div className="primary-stat">Week 2 - Week 1 Case Rate: {(selectedTownData.days[2][caseRateProperty] - selectedTownData.days[1][caseRateProperty])-(selectedTownData.days[1][caseRateProperty] - selectedTownData.days[0][caseRateProperty])}</div>
                            <div>Week 1 New Cases: {selectedTownData.days[1][caseTotalProperty] - selectedTownData.days[0][caseTotalProperty]}</div>
                            <div>Week 2 New Cases: {selectedTownData.days[2][caseTotalProperty] - selectedTownData.days[1][caseTotalProperty]}</div>
                            <div>Week 1 New Cases / 100K: {selectedTownData.days[1][caseRateProperty] - selectedTownData.days[0][caseRateProperty]}</div>
                            <div>Week 2 New Cases / 100K: {selectedTownData.days[2][caseRateProperty] - selectedTownData.days[1][caseRateProperty]}</div>
                            </>}
                            {colorType === "Caserate" && <>
                            <div>{selectedTownDays} day period</div>
                            <div>Total New Cases ({selectedTownData.days[2][caseTotalProperty]} - {selectedTownData.days[0][caseTotalProperty]}):  {selectedTownData.days[2][caseTotalProperty] - selectedTownData.days[0][caseTotalProperty]}{selectedTownData.days[2][caseTotalProperty] - selectedTownData.days[0][caseTotalProperty]<0?" (correction)":""}</div>
                            <div className="primary-stat">New Cases / 100K: {selectedTownData.days[2][caseRateProperty] - selectedTownData.days[0][caseRateProperty]}{selectedTownData.days[2][caseRateProperty] - selectedTownData.days[0][caseRateProperty]<0?" (correction)":""}</div>
                            <div>Start Cases / 100K: {selectedTownData.days[0][caseRateProperty]}</div>
                            <div>End Cases / 100K: {selectedTownData.days[2][caseRateProperty]}</div>
                            </>}
                        </>
                    }
                </div>
            }
            </div>
            
        </div>
    )
}

export default MapView;