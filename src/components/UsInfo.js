import { useEffect } from 'react';
import { CartesianGrid, Tooltip, XAxis, YAxis, AreaChart, Area,ResponsiveContainer } from 'recharts';
import { fetchUsWideDaily } from '../api/UsApi';
import { Loading } from './Loading';
import Navbar from './Navbar';

const colors = ['#e6194b', '#3cb44b', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#008080', '#9a6324', '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080', '#ffffff', '#000000']

function UsInfo({data, setData}) {
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
                day.dateString = `${dt.getMonth()+1}/${dt.getDate()}`;
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

    return <div className="graph-details">
        <Navbar pageName="US Data" />
        <div className="toolbar d-none d-md-block">
            <h3>US Data</h3>
        </div>
        <div className="details graph-details">
            <div className="row graph-row">
                <div className="col-md-6">
                    <div className="graph">
                        <h4>Hospitalizations, ICU, &amp; Vent</h4>
                        <h5>Daily Reported Hospitalizations &amp; ICU</h5>
                        <ResponsiveContainer width={"95%"} height={200}>
                            <AreaChart data={data} >
                                <XAxis stroke="white" dataKey="dateString" angle={-90} textAnchor="end" orientation="bottom" height={50} />
                                <YAxis tickFormatter={tickFormatter} stroke="white" domain={[0, 'auto']} dataKey={(v)=>parseInt(v.hospitalizedCurrently)}  Id="left"/>
                                <Area formatter={valueFormatter} strokeWidth="2" name="Total Hospitalization"   Id="left" type="linear" dataKey="hospitalizedCurrently" stroke={colors[0]} fill={colors[0]} />
                                <Area formatter={valueFormatter} strokeWidth="2" name="Total ICU"   Id="left" type="linear" dataKey="inIcuCurrently" stroke={colors[1]} fill={colors[1]} />
                                <Area formatter={valueFormatter} strokeWidth="2" name="Total Ventilator"   Id="left" type="linear" dataKey="onVentilatorCurrently" stroke={colors[4]} fill={colors[4]} />
                                <Tooltip />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="graph">
                        <h4>Total Test Results</h4>
                        <h5>Cumulative</h5>
                        <ResponsiveContainer width={"95%"} height={200}>
                            <AreaChart data={data} >
                                <XAxis stroke="white" dataKey="dateString" angle={-90} textAnchor="end" orientation="bottom" height={50} />
                                <YAxis tickFormatter={tickFormatter} stroke="white" domain={['auto', 'auto']} dataKey={(v)=>v.totalTestResultsCalc}  Id="left"/>
                                <Area formatter={valueFormatter} strokeWidth="2" name="Total Test Results" YAxis Id="left" type="linear" dataKey="totalTestResultsCalc" stroke={colors[2]} fill={colors[2]} />
                                <Area formatter={valueFormatter} strokeWidth="2" name="Negative Results" YAxis Id="left" type="linear" dataKey="negative" stroke={colors[3]} fill={colors[3]} />                                
                                <Area formatter={valueFormatter} strokeWidth="2" name="Positive Results" YAxis Id="left" type="linear" dataKey="positive" stroke={colors[4]} fill={colors[4]} />                           
                                <Area formatter={valueFormatter} strokeWidth="2" name="Pending Results" YAxis Id="left" type="linear" dataKey="pending" stroke={colors[5]} fill={colors[5]} />
                                <Tooltip />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="graph">
                        <h4>Total Deaths</h4>
                        <h5>Cumulative</h5>
                        <ResponsiveContainer width={"95%"} height={200}>
                            <AreaChart data={data} >
                                <XAxis stroke="white" dataKey="dateString" angle={-90} textAnchor="end" orientation="bottom" height={50} />
                                <YAxis tickFormatter={tickFormatter} stroke="white" domain={['0', 'auto']} dataKey={(v)=>v.death}  Id="left"/>
                                <Area formatter={valueFormatter} strokeWidth="2" name="Total Deaths" YAxis Id="left" type="linear" dataKey="death" stroke={colors[3]} fill={colors[3]} />
                                <Tooltip />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="col-md-6 zhi">
                    <div className="graph">
                        <h4>Total Cases &amp; Total Recovered</h4>
                        <h5>Cumulative</h5>
                        <ResponsiveContainer width={"95%"} height={200}>
                            <AreaChart data={data} >
                                <XAxis stroke="white" dataKey="dateString" angle={-90} textAnchor="end" orientation="bottom" height={50} />
                                <YAxis tickFormatter={tickFormatter} stroke="white" domain={[0, 'auto']} dataKey={(v)=>v.positive}  Id="left"/>
                                <Area formatter={valueFormatter} strokeWidth="2" name="Total Cases"   Id="left" type="linear" dataKey="positive" stroke={colors[1]} fill={colors[1]} />
                                <Area formatter={valueFormatter} strokeWidth="2" name="Total Recovered"   Id="left" type="linear" dataKey="recovered" stroke={colors[6]} fill={colors[6]} />
                                <Tooltip />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="graph">
                        <h4>Daily Case Change</h4>
                        <h5>Change in Number of Cases by Day</h5>
                        <ResponsiveContainer width={"95%"} height={200}>
                            <AreaChart data={data} >
                                <XAxis stroke="white" dataKey="dateString" angle={-90} textAnchor="end" orientation="bottom" height={50} />
                                <YAxis tickFormatter={tickFormatter} stroke="white" domain={[0, 'auto']} dataKey={(v)=>v.positiveIncrease}  Id="left"/>
                                <Area formatter={valueFormatter} strokeWidth="2" name="Case Change"   Id="left" type="linear" dataKey="positiveIncrease" stroke={colors[4]} fill={colors[4]} />
                                <CartesianGrid strokeDasharray="3 3" />
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