
import { useEffect, useState } from 'react';
import { Loading } from './Loading';
import Navbar from './Navbar';

function MapView({townList, recentWeekRange, geoData, onDateRangeChange}) {
    const [selectedTown, setSelectedTown] = useState(null);
    useEffect(()=>{
        if ( geoData && recentWeekRange && !selectedTown) {
            let worstTown = null;
            let worstRateChange = -10000;
            geoData.townMap.forEach((town)=>{
                let townData = recentWeekRange.townDataMap[town.town_no];
                let rateChange = (townData.days[1][caseRateProperty] - townData.days[0][caseRateProperty]);
                if ( rateChange > worstRateChange ) {
                    worstTown = town;
                    worstRateChange = rateChange;
                }
            });
            setSelectedTown(worstTown);
        }
    }, [geoData, recentWeekRange, selectedTown]);
    


    const caseRateProperty = "towncaserate";
    const caseTotalProperty = "towntotalcases";

    if (!geoData || !townList || !recentWeekRange) {
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
    geoData.townMap.forEach((town)=>{
        let townData = recentWeekRange.townDataMap[town.town_no];
        let rateChange = (townData.days[1][caseRateProperty] - townData.days[0][caseRateProperty]);
        maxChange = Math.max(rateChange, maxChange);
    });

    const townFill = (town)=> {
        let townData = recentWeekRange.townDataMap[town.town_no];
        let rateChange = townData.days[1][caseRateProperty] - townData.days[0][caseRateProperty];
        let r = rateChange > 30 && Math.trunc(Math.min(245, 245 * (rateChange / maxChange))) || 0;
        let g = rateChange < 30 && Math.trunc(Math.min(245, 150 * ((50 - rateChange) / 50))) || 0;
        let b = 0;//Math.trunc(80 - Math.abs(r + g));
        return `RGB(${r},${g},${b})`
    }

    let selectedTownData = selectedTown && recentWeekRange && recentWeekRange.townDataMap &&
        recentWeekRange.townDataMap[selectedTown.town_no] || null;
    let selectedTownDays = 0;

    if ( selectedTownData ) {
        selectedTownDays = new Date(selectedTownData.days[1].lastupdatedate).getDaysSince(new Date(selectedTownData.days[0].lastupdatedate))
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
            <h4 className="instr">Weekly Case Rate (per 100K)</h4>
            <div className="date-range d-flex justify-content-center align-items-center">
                <div className="c1">
                    <button className="date-btn" onClick={handleDateBack} title="Back One Week"><i className="fa fa-angle-double-left" /></button>
                </div>
                <div className="c2">
                    <span>{new Date(recentWeekRange.townDataMap["1"].days[0].lastupdatedate).toDateString()}</span>
                    <span>&nbsp;-&nbsp;</span>
                    <span>{new Date(recentWeekRange.townDataMap["1"].days[1].lastupdatedate).toDateString()}</span> 
                </div>
                <div className="c1">
                    <button className="date-btn" onClick={handleDateForward} title="Forward One Week"><i className="fa fa-angle-double-right" /></button>
                </div>
            </div>
            <div>
                <div className="instr">Touch a Town for Details</div>
            </div>

            <div className="row">
                <div className="col-md-8">
                    <div className="mapwrap">
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
                    </div>
                </div>
                <div className="col-md-4">
                    {selectedTown && 
                        <div className="selected-town mb-5">
                            <h3>{selectedTown.town}</h3>
                            {selectedTownData && <>
                                    <div>Population: {selectedTownData.population}</div>
                                    <div>{selectedTownDays} day period starting {new Date(recentWeekRange.townDataMap["1"].days[0].lastupdatedate).toDateString()}</div>
                                    <div>Total New Cases ({selectedTownData.days[1][caseTotalProperty]} - {selectedTownData.days[0][caseTotalProperty]}):  {selectedTownData.days[1][caseTotalProperty] - selectedTownData.days[0][caseTotalProperty]}{selectedTownData.days[1][caseTotalProperty] - selectedTownData.days[0][caseTotalProperty]<0?" (correction)":""}</div>
                                    <div className="primary-stat">New Cases / 100K: {selectedTownData.days[1][caseRateProperty] - selectedTownData.days[0][caseRateProperty]}{selectedTownData.days[1][caseRateProperty] - selectedTownData.days[0][caseRateProperty]<0?" (correction)":""}</div>
                                    <div>Start Cases / 100K: {selectedTownData.days[0][caseRateProperty]}</div>
                                    <div>End Cases / 100K: {selectedTownData.days[1][caseRateProperty]}</div>
                                </>
                            }
                        </div>
                    }
                    </div>
                </div>
            </div>
            
        </div>
    )
}

export default MapView;