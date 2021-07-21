import { Fragment } from "react";

function LastFewDays({days}) {

    let lastFewDays = days.slice(days.length - 6).reverse();
    console.log(lastFewDays);
    return <><div className="row">
            <div className="col-sm-12">Recent Data</div>
        </div>
        <div className="tbl-wrap">
        <div className="row tbl tbl-header">
            <div className="col-sm-3">Date</div>
            <div className="col-sm-2">Cases</div>
            <div className="col-sm-2">Deaths</div>
            <div className="col-sm-2">New Cases</div>
            <div className="col-sm-3">New Deaths</div>
        </div>
        {
            lastFewDays.map((day,ix)=>{
                if ( ix > 0 ) {
                    let priorDay = lastFewDays[ix-1];
                    return <div className="row tbl">
                            <div className="col-sm-3">{day.date} - {priorDay.date}</div>
                            <div className="col-sm-2">{priorDay.towntotalcases}</div>
                            <div className="col-sm-2">{priorDay.towntotaldeaths}</div>
                            <div className="col-sm-2">{priorDay.towntotalcases - day.towntotalcases}</div>
                            <div className="col-sm-3">{priorDay.towntotaldeaths - day.towntotaldeaths}</div>
                        </div>
                }
            })
        }
        </div>
    </>
}

export default LastFewDays;