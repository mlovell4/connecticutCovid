import { useEffect, useState } from 'react';
import { CartesianGrid, Tooltip, XAxis, YAxis, AreaChart, Area,ResponsiveContainer } from 'recharts';
import { fetchUsWideDaily } from '../api/UsApi';
import Config from '../Config';
import { Loading } from './Loading';
import Navbar from './Navbar';
import YearSlider from './slider/slider';

const colors = ['#e6194b', '#3cb44b', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#008080', '#9a6324', '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080', '#ffffff', '#000000']

function UsInfo({data, setData}) {
    const [rangeLimit, setRangeLimit] = useState(null);
    useEffect(()=>{
        let startDay = 0;
        if (!data) {
            fetchUsWideDaily().then((json)=>setData((json.sort((a,b)=> {
                    if (a.date>b.date) return 1;
                    if (a.date<b.date) return -1;
                    return 0;
                }
            ).map((day,ix)=>{
                if (day.date === 20200322) startDay = ix;
                day.date = "" + day.date;
                let dt = new Date(day.date.substring(0,4),day.date.substring(4,6)-1,day.date.substring(6,8));
                day.dt = dt;
                day.dateString = `${Config.months[dt.getMonth()]} ${dt.getDate()}`;
                day.totalTestResultsCalc = day.positive + day.negative + day.pending;
                return day;
            }).slice(startDay))));
        }
    }, [data, setData]);
    if (!data) {
        return <Loading>Loading...</Loading>
    }
    const refresh = () => {
        setData(null);
    }

    const lastRange = {
        dt: `${data[data.length-1].dt.toDateString()}`,
        range: `${data[data.length-2].dt.toDateString()} - ${data[data.length-1].dt.toDateString()}`,
        days: data[data.length-1].dt.getDaysSince(data[data.length-2].dt),
        deaths: data[data.length-1].death - data[data.length-2].death,
        positive: data[data.length-1].positive - data[data.length-2].positive,
        recovered: data[data.length-1].recovered - data[data.length-2].recovered,
        hospital: data[data.length-1].hospitalizedCurrently - data[data.length-2].hospitalizedCurrently,
        icu: data[data.length-1].inIcuCurrently - data[data.length-2].inIcuCurrently }


    const tickFormatter = (number) => {
        if(number > 1000000000){
          return (number/1000000000).toString() + 'B';
        }else if(number > 1000000){
          return (number/1000000).toString() + 'M';
        }else if(number > 1000){
          return (number/1000).toString() + 'K';
        }else{
          return number.toString();
        }
    }

    const valueFormatter = (number) => {
        return new Intl.NumberFormat().format(number)
    }

    const firstDay = data[0].dt;
    const lastDay = data[data.length-1].dt;

    const handleSliderChange = (start, end) => {
        setRangeLimit({start, end});
    }

    let rangeLimitedData = data;
    if ( rangeLimit ) {
        rangeLimitedData = data.filter((day)=>{
            return day.dt >= rangeLimit.start && day.dt <= rangeLimit.end
        });
    }

    return <div className="graph-details">
        <Navbar pageName="US Data" />
        <div className="toolbar d-none d-md-block">
            <h3>US Data</h3>
        </div>
        <div className="details graph-details">
            <div className="row graph-row">
                {lastRange.days === 1 && 
                <div className="col-md-12 text-center">
                    <h5>{lastRange.dt}</h5>
                    <div>Deaths: {lastRange.deaths}</div>
                    <div>Positive Tests: {lastRange.positive}</div>
                    <div>Hospitalizations Change: {lastRange.hospital}</div>
                    <div>ICU Change: {lastRange.icu}</div>
                </div>}
                <div className="col-md-12 text-center">
                    <YearSlider firstDay={firstDay} lastDay={lastDay} className="slider" onChange={handleSliderChange}/>
                </div>
                <div className="col-md-6">
                    <div className="graph">
                        <h4>Hospitalizations, ICU, &amp; Vent</h4>
                        <h5>Daily Reported Hospitalizations &amp; ICU</h5>
                        <ResponsiveContainer width={"95%"} height={200}>
                            <AreaChart data={rangeLimitedData} >
                                <XAxis stroke="white" dataKey="dateString" angle={-90} textAnchor="end" orientation="bottom" height={60} />
                                <YAxis tickFormatter={tickFormatter} stroke="white" domain={[0, 'auto']} dataKey={(v)=>parseInt(v.hospitalizedCurrently)}  Id="left"/>
                                <Area formatter={valueFormatter} strokeWidth="2" name="Total Hospitalization"   Id="left" type="linear" dataKey="hospitalizedCurrently" stroke={colors[0]} fill={colors[0]} />
                                <Area formatter={valueFormatter} strokeWidth="2" name="Total ICU"   Id="left" type="linear" dataKey="inIcuCurrently" stroke={colors[1]} fill={colors[1]} />
                                <Area formatter={valueFormatter} strokeWidth="2" name="Total Ventilator"   Id="left" type="linear" dataKey="onVentilatorCurrently" stroke={colors[4]} fill={colors[4]} />
                                <Tooltip />
                                <CartesianGrid strokeDasharray="3 3" stroke="#444444" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="graph">
                        <h4>Total Test Results</h4>
                        <h5>Cumulative</h5>
                        <ResponsiveContainer width={"95%"} height={200}>
                            <AreaChart data={rangeLimitedData} >
                                <XAxis stroke="white" dataKey="dateString" angle={-90} textAnchor="end" orientation="bottom" height={60} />
                                <YAxis tickFormatter={tickFormatter} stroke="white" domain={[0, 'auto']} dataKey={(v)=>v.totalTestResultsCalc}  Id="left"/>
                                <Area formatter={valueFormatter} strokeWidth="2" name="Total Test Results" YAxis Id="left" type="linear" dataKey="totalTestResultsCalc" stroke={colors[2]} fill={colors[2]} />
                                <Area formatter={valueFormatter} strokeWidth="2" name="Negative Results" YAxis Id="left" type="linear" dataKey="negative" stroke={colors[3]} fill={colors[3]} />                                
                                <Area formatter={valueFormatter} strokeWidth="2" name="Positive Results" YAxis Id="left" type="linear" dataKey="positive" stroke={colors[4]} fill={colors[4]} />                           
                                <Area formatter={valueFormatter} strokeWidth="2" name="Pending Results" YAxis Id="left" type="linear" dataKey="pending" stroke={colors[5]} fill={colors[5]} />
                                <Tooltip />
                                <CartesianGrid strokeDasharray="3 3" stroke="#444444" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="graph">
                        <h4>Total Deaths</h4>
                        <h5>Cumulative</h5>
                        <ResponsiveContainer width={"95%"} height={200}>
                            <AreaChart data={rangeLimitedData} >
                                <XAxis stroke="white" dataKey="dateString" angle={-90} textAnchor="end" orientation="bottom" height={60} />
                                <YAxis tickFormatter={tickFormatter} stroke="white" domain={['auto', 'auto']} dataKey={(v)=>v.death}  Id="left"/>
                                <Area formatter={valueFormatter} strokeWidth="2" name="Total Deaths" YAxis Id="left" type="linear" dataKey="death" stroke={colors[3]} fill={colors[3]} />
                                <Tooltip />
                                <CartesianGrid strokeDasharray="3 3" stroke="#444444" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="col-md-6 zhi">
                    <div className="graph">
                        <h4>Total Cases &amp; Total Recovered</h4>
                        <h5>Cumulative</h5>
                        <ResponsiveContainer width={"95%"} height={200}>
                            <AreaChart data={rangeLimitedData} >
                                <XAxis stroke="white" dataKey="dateString" angle={-90} textAnchor="end" orientation="bottom" height={60} />
                                <YAxis tickFormatter={tickFormatter} stroke="white" domain={[0, 'auto']} dataKey={(v)=>v.positive}  Id="left"/>
                                <Area formatter={valueFormatter} strokeWidth="2" name="Total Cases"   Id="left" type="linear" dataKey="positive" stroke={colors[1]} fill={colors[1]} />
                                <Area formatter={valueFormatter} strokeWidth="2" name="Total Recovered"   Id="left" type="linear" dataKey="recovered" stroke={colors[6]} fill={colors[6]} />
                                <Tooltip />
                                <CartesianGrid strokeDasharray="3 3" stroke="#444444" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="graph">
                        <h4>Daily Case Change</h4>  
                        <h5>Change in Number of Cases by Day</h5>
                        <ResponsiveContainer width={"95%"} height={200}>
                            <AreaChart data={rangeLimitedData} >
                                <XAxis stroke="white" dataKey="dateString" angle={-90} textAnchor="end" orientation="bottom" height={60} />
                                <YAxis tickFormatter={tickFormatter} stroke="white" domain={['auto', 'auto']} dataKey={(v)=>v.positiveIncrease}  Id="left"/>
                                <Area formatter={valueFormatter} strokeWidth="2" name="Case Change"   Id="left" type="linear" dataKey="positiveIncrease" stroke={colors[4]} fill={colors[4]} />
                                <CartesianGrid strokeDasharray="3 3" stroke="#444444" />
                                <Tooltip />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>

    </div>
}

export default UsInfo;