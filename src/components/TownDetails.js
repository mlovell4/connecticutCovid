
import { useEffect, useState } from 'react';
import {useHistory, useParams} from 'react-router-dom';
import { CartesianGrid, Tooltip, XAxis, YAxis, AreaChart, Area, ResponsiveContainer } from 'recharts';

import { fetchTownAggregates } from '../api/ConnecticutApi';
import { Loading } from './Loading';
import Navbar from './Navbar';

function TownDetails({onShowTownList}) {
    let {town_no} = useParams();
    let [data, setData] = useState(null);
    let history = useHistory();
    useEffect(()=>{
        fetchTownAggregates(town_no).then((data)=>{
            data = data.sort((a,b)=>{
                if (a.lastupdatedate>b.lastupdatedate) return 1;
                if (a.lastupdatedate<b.lastupdatedate) return -1;
                return 0;
            });
            data.forEach((pt, ix)=>{
                pt.index=ix;
                let dt = new Date(pt.lastupdatedate);
                pt.date = `${dt.getMonth()+1}/${dt.getDate()}`;
                pt.dt = dt;
                if (ix>0) {
                    pt.casechange = pt.towntotalcases - data[ix-1].towntotalcases;
                }
            })
            setData(data);
        })
    }, [town_no]);
    if (!data) {
        return <Loading>Loading...</Loading>
    }
    const closeDetails = () => {
        history.push("/towns");
    }

    const lastReportedPeriod = `${data[data.length-2].date} - ${data[data.length-1].date}`;
    const lastReportedPeriodDays = data[data.length-1].dt.getDaysSince(data[data.length-2].dt);
    const lastReportedPeriodStr = lastReportedPeriodDays === 1 ? "day" : `${lastReportedPeriodDays} days`

    return <div className="details graph-details">
        <Navbar pageName={"Details for " + data[0].town} />
        <h3 className="pb-3 d-none d-md-block">Details for {data[0].town}</h3>
        <div className="row graph-row">
            <div className="col-md-12">
                <h5>Last Reported Period: {lastReportedPeriod}</h5>
                New Deaths in last {lastReportedPeriodStr}: {Math.max(0,data[data.length-1].towntotaldeaths - data[data.length-2].towntotaldeaths)}<br />
                New Cases in last {lastReportedPeriodStr}: {Math.max(0,data[data.length-1].towntotalcases - data[data.length-2].towntotalcases)}<br />
            </div>
            <div className="col-md-6">
                <div className="graph">
                    <h4>Total Cases</h4>
                    <h5>Cumulative</h5>
                    <ResponsiveContainer width={"95%"} height={200}>
                        <AreaChart data={data} >
                            <XAxis stroke="white" dataKey="date" angle={-90} textAnchor="end" orientation="bottom" height={50} />
                            <YAxis stroke="white" domain={[0, 'auto']} dataKey={(v)=>parseInt(v.towntotalcases)}  Id="left"/>
                            <Area strokeWidth="2" name="Total Cases" Id="left" type="natural" dataKey="towntotalcases" stroke="#dd8888" fill="#dd888888" />
                            <CartesianGrid strokeDasharray="3 3" />
                            <Tooltip />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="col-md-6">
                <div className="graph">
                    <h4>People Tested</h4>
                    <h5>Cumulative</h5>
                    <ResponsiveContainer width={"95%"} height={200}>
                        <AreaChart data={data} >
                            <XAxis stroke="white" dataKey="date" angle={-90} textAnchor="end" orientation="bottom" height={50} />
                            <YAxis stroke="white" domain={[0, 'auto']} dataKey={(v)=>parseInt(v.peopletested)}  Id="left"/>
                            <Area strokeWidth="2" name="People Tested" Id="left" type="natural" dataKey="peopletested" stroke="#8888dd" fill="#8888dd88" />
                            <CartesianGrid strokeDasharray="3 3" />
                            <Tooltip />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        <div className="row graph-row">
            <div className="col-md-6">
                <div className="graph">
                    <h4>Total Deaths</h4>
                    <h5>Cumulative (with Corrections in Reported Number)</h5>
                    <ResponsiveContainer width={"95%"} height={200}>
                        <AreaChart data={data} >
                            <XAxis stroke="white" dataKey="date" angle={-90} textAnchor="end" orientation="bottom" height={50} />
                            <YAxis stroke="white" domain={[0, 'auto']} dataKey={(v)=>parseInt(v.towntotaldeaths)}  Id="left"/>
                            <Area strokeWidth="2" name="Total Deaths" Id="left" type="linear" dataKey="towntotaldeaths" stroke="#aaaa00" fill="#aaaa0088" />
                            <CartesianGrid strokeDasharray="3 3" />
                            <Tooltip />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="col-md-6">
                <div className="graph">
                    <h4>Cases Change</h4>
                    <h5>Change in Total Number of Cases By Day</h5>
                    <ResponsiveContainer width={"95%"} height={200}>
                        <AreaChart data={data} >
                            <XAxis stroke="white" dataKey="date" angle={-90} textAnchor="end" orientation="bottom" height={50} />
                            <YAxis stroke="white" domain={[0, 'auto']} dataKey={(v)=>parseInt(v.casechange)}  Id="left"/>
                            <Area strokeWidth="2" name="Case Change" Id="left" type="linear" dataKey="casechange" stroke="#55dd55" fill="#55dd5588" />
                            <CartesianGrid strokeDasharray="3 3" />
                            <Tooltip />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    </div>
}

export default TownDetails;