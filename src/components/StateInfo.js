
import { useEffect, useState } from 'react';
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis, AreaChart, Area,ResponsiveContainer } from 'recharts';
import { fetchStateWideDaily, fetchStateWideAgeGroupDaily } from '../api/ConnecticutApi';
import Config from '../Config';
import { Loading } from './Loading';
import Navbar from './Navbar';
import YearSlider from './slider/slider';

const colors = ['#e6194b', '#3cb44b', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#008080', '#9a6324', '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080', '#ffffff', '#000000'];

const tickFormatter = (number) => {
    if(number > 10000000000){
      return (number/1000000000).toString() + 'B';
    }else if(number > 10000000){
      return (number/1000000).toString() + 'M';
    }else if(number > 100000){
      return (number/1000).toString() + 'K';
    }else{
      return number.toString();
    }
}

const tickFormatter2 = (number) => {
    number = Math.trunc(number);
    if(number > 10000000000){
      return (number/1000000000).toString() + 'B';
    }else if(number > 10000000){
      return (number/1000000).toString() + 'M';
    }else if(number > 100000){
      return (number/1000).toString() + 'K';
    }else{
      return number.toString();
    }
}

function StateInfo({data, setData, ageGroupData, setAgeGroupData}) {
    const [rangeLimit, setRangeLimit] = useState(null);
    useEffect(()=>{
        if (!data) {
            fetchStateWideDaily().then((json)=>setData(json.sort((a,b)=> {
                    if (a.date>b.date) return 1;
                    if (a.date<b.date) return -1;
                    return 0;
                }
            ).map((day,ix)=>{
                let dt = new Date(day.date);
                day.dt = dt;
                day.dateString = `${Config.months[dt.getMonth()]} ${dt.getDate()}`;
                if (ix>0) {
                    day.casechange = Math.round((day.totalcases - json[ix-1].totalcases) / dt.getDaysSince(new Date(json[ix-1].date)));
                }
                if (ix>0) {
                    day.hospitalizationsChange = day.hospitalizedcases - json[ix-1].hospitalizedcases;
                }
                return day;
            })));
        }
        if (!ageGroupData) {
            fetchStateWideAgeGroupDaily().then((json)=>{
                let daysMap = {};
                let days = [];
                let maxDeaths = 0;
                let maxCaseRate = 0;
                let maxCases = 0;
                json.forEach((ageGroupDay)=>{
                    let day = daysMap[ageGroupDay.dateupdated];
                    if (!day) {
                        day = {};
                        let dt = new Date(ageGroupDay.dateupdated);
                        day.date = ageGroupDay.dateupdated;
                        day.dt = dt;
                        day.dateString = `${Config.months[dt.getMonth()]} ${dt.getDate()}`;
                        daysMap[ageGroupDay.dateupdated] = day;
                        days.push(day);
                    }
                    let suffix = ageGroupDay.agegroups.replace("-","_");
                    if (ageGroupDay.agegroups === '80 and older') suffix = "80_older"
                    day["totalCases_" + suffix] = ageGroupDay.totalcases;
                    day["totalDeaths_" + suffix] = ageGroupDay.totaldeaths;
                    day["totalCaseRate_" + suffix] = ageGroupDay.totalcaserate;
                    maxDeaths = Math.max(maxDeaths, parseFloat(ageGroupDay.totaldeaths));
                    if (ageGroupDay.totalcaserate) maxCaseRate = Math.max(maxCaseRate, parseFloat(ageGroupDay.totalcaserate));
                    maxCases = Math.max(maxCases, parseFloat(ageGroupDay.totalcases));
                });
                setAgeGroupData({days:days.sort((a,b)=>{
                            if (a.dt>b.dt) return 1;
                            if (b.dt>a.dt) return -1;
                            return 0;
                        }),
                        maxDeaths,
                        maxCaseRate,
                        maxCases
                    }
                );
            })
        }
    }, [data, ageGroupData, setAgeGroupData, setData]);
    if (!data) {
        return <Loading>Loading...</Loading>
    }
    let maxAgeGroup = 0;
    data.forEach((day)=>{
        maxAgeGroup = Math.max(maxAgeGroup, 
            day.cases_age0_9, 
            day.cases_age10_19,
            day.cases_age20_29,
            day.cases_age30_39,
            day.cases_age40_49,
            day.cases_age50_59,
            day.cases_age60_69,
            day.cases_age70_79,
            day.cases_age80_older
            )
    });

    maxAgeGroup = ~~((maxAgeGroup + 99)/100) * 100;

    const refresh = () => {
        setAgeGroupData(null);
        setData(null);

    }


    const firstDay = data[0].dt;
    const lastDay = data[data.length-1].dt;

    const handleSliderChange = (start, end) => {
        setRangeLimit({start, end});
    }

    let rangeLimitedAgeGroupData = ageGroupData;
    let rangeLimitedData = data;
    if ( rangeLimit ) {
        rangeLimitedData = data.filter((day)=>{
            return day.dt >= rangeLimit.start && day.dt <= rangeLimit.end
        });
        const days = ageGroupData.days.filter((day)=>{
            return day.dt >= rangeLimit.start && day.dt <= rangeLimit.end;
        });
        rangeLimitedAgeGroupData = {...ageGroupData, days};
    }


    const lastReportDay = `${data[data.length-1].dt.toDateString()}`;
    const lastReportedPeriodDays = data[data.length-1].dt.getDaysSince(data[data.length-2].dt);


    return <div className="graph-details">
        <Navbar pageName="Connecticut Statewide Data"/>
        <div className="toolbar d-none d-md-block">
            <h3>Connecticut Statewide Data</h3>
        </div>
        <div className="details graph-details">
            <div className="row graph-row">
                <div className="col-md-12">
                    {lastReportedPeriodDays === 1 && 
                    <div>
                    <h5>{lastReportDay}</h5>
                    New Deaths: {Math.max(0,data[data.length-1].totaldeaths - data[data.length-2].totaldeaths)}<br />
                    New Cases: {Math.max(0,data[data.length-1].totalcases - data[data.length-2].totalcases)}<br />
                    Hospitalizations Change: {data[data.length-1].hospitalizedcases - data[data.length-2].hospitalizedcases}<br />
                    </div>
                    }
                </div>
                <div className="col-md-12 text-center">
                    <YearSlider firstDay={firstDay} lastDay={lastDay} className="slider" onChange={handleSliderChange}/>
                </div>
                <div className="col-md-6">
                    <div className="graph">
                        <h4>Hospitalizations</h4>
                        <h5>Daily Reported Hospitalizations</h5>
                        <ResponsiveContainer width={"95%"} height={200}>
                            <AreaChart data={rangeLimitedData} >
                                <XAxis stroke="white" dataKey="dateString" angle={-90} textAnchor="end" orientation="bottom" height={60} />
                                <YAxis tickFormatter={tickFormatter} stroke="white" domain={[0, 'auto']} dataKey={(v)=>parseInt(v.hospitalizedcases)}  Id="left"/>
                                <Area strokeWidth="2" name="Total Hospitalization"   Id="left" type="linear" dataKey="hospitalizedcases" stroke={colors[0]} fill={colors[0]} />
                                <Tooltip />
                                <CartesianGrid strokeDasharray="3 3" stroke="#444444" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="graph">
                        <h4>Hospitalizations Change</h4>
                        <h5>Change In Hospitalizations By Day</h5>
                        <ResponsiveContainer width={"95%"} height={200}>
                            <AreaChart data={rangeLimitedData} >
                                <XAxis stroke="white" dataKey="dateString" angle={-90} textAnchor="end" orientation="bottom" height={60} />
                                <YAxis tickFormatter={tickFormatter} stroke="white" domain={['auto', 'auto']} dataKey={(v)=>parseInt(v.hospitalizationsChange)}  Id="left"/>
                                <Area strokeWidth="2" name="Hospitalization Change" YAxis Id="left" type="linear" dataKey="hospitalizationsChange" stroke={colors[2]} fill={colors[2]} />
                                <Tooltip />
                                <CartesianGrid strokeDasharray="3 3" stroke="#444444" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="col-md-6 zhi">
                    <div className="graph">
                        <h4>Total Cases</h4>
                        <h5>Cumulative</h5>
                        <ResponsiveContainer width={"95%"} height={200}>
                            <AreaChart data={rangeLimitedData} >
                                <XAxis stroke="white" dataKey="dateString" angle={-90} textAnchor="end" orientation="bottom" height={60} />
                                <YAxis tickFormatter={tickFormatter} stroke="white" domain={[0, 'auto']} dataKey={(v)=>parseInt(v.totalcases)}  Id="left"/>
                                <Area strokeWidth="2" name="Total Cases"   Id="left" type="linear" dataKey="totalcases" stroke={colors[1]} fill={colors[1]} />
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
                                <YAxis stroke="white" domain={[0, 'auto']} dataKey={(v)=>parseInt(v.casechange)}  Id="left"/>
                                <Area strokeWidth="2" name="Case Change"   Id="left" type="linear" dataKey="casechange" stroke={colors[4]} fill={colors[4]} />
                                <Tooltip />
                                <CartesianGrid strokeDasharray="3 3" stroke="#444444" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="col-md-6 zhi">
                    <div className="graph">
                        <h4>Total Deaths</h4>
                        <h5>Cumulative</h5>
                        <ResponsiveContainer width={"95%"} height={200}>
                            <AreaChart data={rangeLimitedData} >
                                <XAxis stroke="white" dataKey="dateString" angle={-90} textAnchor="end" orientation="bottom" height={60} />
                                <YAxis tickFormatter={tickFormatter} stroke="white" domain={['0', 'auto']} dataKey={(v)=>parseInt(v.totaldeaths)}  Id="left"/>
                                <Area strokeWidth="2" name="Total Deaths" YAxis Id="left" type="linear" dataKey="totaldeaths" stroke={colors[3]} fill={colors[3]} />
                                <Tooltip />
                                <CartesianGrid strokeDasharray="3 3" stroke="#444444" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="graph">
                        <h4>Cases By Age Group</h4>
                        <h5>Cumulative</h5>
                        <ResponsiveContainer width={"95%"} height={200}>
                            <LineChart data={rangeLimitedData} >
                                <XAxis stroke="white" dataKey="dateString" angle={-90} textAnchor="end" orientation="bottom" height={60} />
                                <YAxis tickFormatter={tickFormatter2} stroke="white" domain={[0, maxAgeGroup * 1.1]}/>
                                <Line strokeWidth="2" dot={false} stroke={colors[0]} name="Age 0-9" type="linear" dataKey="cases_age0_9"/>
                                <Line strokeWidth="2" dot={false} stroke={colors[1]} name="Age 10-19" type="linear" dataKey="cases_age10_19"/>
                                <Line strokeWidth="2" dot={false} stroke={colors[2]} name="Age 20-29" type="linear" dataKey="cases_age20_29"/>
                                <Line strokeWidth="2" dot={false} stroke={colors[3]} name="Age 30-39" type="linear" dataKey="cases_age30_39"/>
                                <Line strokeWidth="2" dot={false} stroke={colors[4]} name="Age 40-49" type="linear" dataKey="cases_age40_49"/>
                                <Line strokeWidth="2" dot={false} stroke={colors[5]} name="Age 50-59" type="linear" dataKey="cases_age50_59"/>
                                <Line strokeWidth="2" dot={false} stroke={colors[6]} name="Age 60-69" type="linear" dataKey="cases_age60_69"/>
                                <Line strokeWidth="2" dot={false} stroke={colors[7]} name="Age 70-79" type="linear" dataKey="cases_age70_79"/>
                                <Line strokeWidth="2" dot={false} stroke={colors[8]} name="Age 80-?" type="linear" dataKey="cases_age80_older"/>
                                <CartesianGrid strokeDasharray="3 3" stroke="#444444" />
                                <Tooltip  contentStyle={{background: 'white', opacity:1}} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                {ageGroupData &&
                <>
                <div className="col-md-6 zmi">
                    <div className="graph zmi">
                        <h4>Case Rate By Age Group</h4>
                        <h5>Cases / 100,000 Cumulative</h5>
                        <ResponsiveContainer width={"95%"} height={200}>
                                <LineChart data={rangeLimitedAgeGroupData.days} >
                                    <XAxis stroke="white" dataKey="dateString" angle={-90} textAnchor="end" orientation="bottom" height={60} />
                                    <YAxis tickFormatter={tickFormatter} stroke="white" domain={[0, ageGroupData.maxCaseRate]}/>
                                    <Line strokeWidth="2" dot={false} stroke={colors[0]} name="Age 0-9" type="linear" dataKey="totalCaseRate_0_9"/>
                                    <Line strokeWidth="2" dot={false} stroke={colors[1]} name="Age 10-19" type="linear" dataKey="totalCaseRate_10_19"/>
                                    <Line strokeWidth="2" dot={false} stroke={colors[2]} name="Age 20-29" type="linear" dataKey="totalCaseRate_20_29"/>
                                    <Line strokeWidth="2" dot={false} stroke={colors[3]} name="Age 30-39" type="linear" dataKey="totalCaseRate_30_39"/>
                                    <Line strokeWidth="2" dot={false} stroke={colors[4]} name="Age 40-49" type="linear" dataKey="totalCaseRate_40_49"/>
                                    <Line strokeWidth="2" dot={false} stroke={colors[5]} name="Age 50-59" type="linear" dataKey="totalCaseRate_50_59"/>
                                    <Line strokeWidth="2" dot={false} stroke={colors[6]} name="Age 60-69" type="linear" dataKey="totalCaseRate_60_69"/>
                                    <Line strokeWidth="2" dot={false} stroke={colors[7]} name="Age 70-79" type="linear" dataKey="totalCaseRate_70_79"/>
                                    <Line strokeWidth="2" dot={false} stroke={colors[8]} name="Age 80-?" type="linear" dataKey="totalCaseRate_80_older"/>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#444444" />
                                    <Tooltip  contentStyle={{background: 'white', opacity:1}} />
                                </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="graph zmi2">
                        <h4>Deaths By Age Group</h4>
                        <h5>Cumulative</h5>
                        <ResponsiveContainer width={"95%"} height={200}>
                                <LineChart data={rangeLimitedAgeGroupData.days} >
                                    <XAxis stroke="white" dataKey="dateString" angle={-90} textAnchor="end" orientation="bottom" height={60} />
                                    <YAxis tickFormatter={tickFormatter} stroke="white" domain={[0, ageGroupData.maxDeaths]}/>
                                    <Line strokeWidth="2" dot={false} stroke={colors[0]} name="Age 0-9" type="linear" dataKey="totalDeaths_0_9"/>
                                    <Line strokeWidth="2" dot={false} stroke={colors[1]} name="Age 10-19" type="linear" dataKey="totalDeaths_10_19"/>
                                    <Line strokeWidth="2" dot={false} stroke={colors[2]} name="Age 20-29" type="linear" dataKey="totalDeaths_20_29"/>
                                    <Line strokeWidth="2" dot={false} stroke={colors[3]} name="Age 30-39" type="linear" dataKey="totalDeaths_30_39"/>
                                    <Line strokeWidth="2" dot={false} stroke={colors[4]} name="Age 40-49" type="linear" dataKey="totalDeaths_40_49"/>
                                    <Line strokeWidth="2" dot={false} stroke={colors[5]} name="Age 50-59" type="linear" dataKey="totalDeaths_50_59"/>
                                    <Line strokeWidth="2" dot={false} stroke={colors[6]} name="Age 60-69" type="linear" dataKey="totalDeaths_60_69"/>
                                    <Line strokeWidth="2" dot={false} stroke={colors[7]} name="Age 70-79" type="linear" dataKey="totalDeaths_70_79"/>
                                    <Line strokeWidth="2" dot={false} stroke={colors[8]} name="Age 80-?" type="linear" dataKey="totalDeaths_80_older"/>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#444444" />
                                    <Tooltip  contentStyle={{background: 'white', opacity:1}} />
                                </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                </>
            }
            </div>
        </div>

    </div>
}

export default StateInfo;