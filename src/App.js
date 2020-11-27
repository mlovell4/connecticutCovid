import './App.scss';
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';
import { useState, useEffect, lazy, Suspense } from 'react';
import { minEndDate, calcDateRange, fetchGeoData, fetchTownAggregateHistoryEndpoint, fetchTownAggregateList, mostRecentGoodDate } from './api/ConnecticutApi';
import { Loading } from './components/Loading';

Date.prototype.getWeekOfMonth = function() {
  var onejan = new Date(this.getFullYear(),this.getMonth(),1);
  var today = new Date(this.getFullYear(),this.getMonth(),this.getDate());
  var dayOfYear = ((today - onejan + 86400000)/86400000);
  return Math.ceil(dayOfYear/7)
};

Date.prototype.getWeekOfYear = function() {
  var onejan = new Date(this.getFullYear(),0,1);
  var today = new Date(this.getFullYear(),this.getMonth(),this.getDate());
  var dayOfYear = ((today - onejan + 86400000)/86400000);
  return Math.ceil(dayOfYear/7)
};

Date.prototype.getDaysSince = function(date) {
  return Math.round((this - date) / 1000 / 60 / 60 / 24);
}

const TownList = lazy(() => import('./components/TownList'));
const TownDetails = lazy(() => import('./components/TownDetails'));
const StateInfo = lazy(() => import('./components/StateInfo'));
const TownFullData = lazy(() => import('./components/TownFullData'));
const UsInfo = lazy(() => import('./components/UsInfo'));
const MapView = lazy(() => import('./components/MapView'));

function App() {
  const [townList, setTownList] = useState(null);
  const [townListState, setTownListState] = useState({});
  const [townFullData, setTownFullData] = useState({});
  const [stateData, setStateData] = useState(null);
  const [stateAgeGroupData, setStateAgeGroupData] = useState(null);
  const [threeWeekData, setThreeWeekData] = useState(null);
  const [usData, setUsData] = useState(null);
  const [geoData, setGeoData] = useState(null);
  const [dateRangeEnd, setDateRangeEnd] = useState(mostRecentGoodDate());
  useEffect(()=>{
    const range = calcDateRange(dateRangeEnd,-1);
    fetchTownAggregateHistoryEndpoint(range).then((data)=>{
      if (data.length < 500) {
        handleDateRangeChange(-1);
        return;
      }
      let townDataMap = {};
      let populations = (threeWeekData && threeWeekData.populations ) || {};
      data.forEach((townDay)=> {
        let townData = townDataMap[townDay.town_no];
        if (!townData) {
          townData = {days:[]};
          townDataMap[townDay.town_no] = townData;
        }
        townData.population = populations[townDay.town_no];
        if (isNaN(townData.population) && townDay.towncaserate > 0) {
          populations[townDay.town_no] = Math.trunc(townDay.towntotalcases / townDay.towncaserate * 100000)
          townData.population = populations[townDay.town_no];
        }
        if (!("towncaserate" in townDay)) {
          townDay.towncaserate = Math.round(parseFloat(townDay.towntotalcases) / populations[townDay.town_no] * 100000);
        }
        if (!("townconfirmedcaserate" in townDay)) {
          townDay.townconfirmedcaserate = Math.round(parseFloat(townDay.townconfirmedcases) / populations[townDay.town_no] * 100000);
        }
        townData.days.push(townDay);
      });
      setThreeWeekData({range,townDataMap,populations});
    });
  },[dateRangeEnd]);
  useEffect(()=>{
    fetchTownAggregateList().then((towns)=>{
      setTownList(towns);
    });
    fetchGeoData().then((json)=>{
        let townMap = []
        let minX = 10000;
        let maxX = -10000;
        let minY = 10000;
        let maxY = -10000;
        json.features.forEach( (feature)=> {
            let coordinates = feature.geometry.coordinates[0];
            townMap.push({coordinates:coordinates[0], town:feature.properties.town, town_no:feature.properties.town_no});
            coordinates[0].forEach( (coord) => {
                minX = Math.min(coord[0], minX);
                maxX = Math.max(coord[0], maxX);
                minY = Math.min(coord[1], minY);
                maxY = Math.max(coord[1], maxY);
            })
            
        })
        setGeoData({townMap, minX, minY, maxX, maxY});
    });     
  },[]);

  const handleDateRangeChange = (dx) => {
    let newDate = new Date(dateRangeEnd);
    newDate.setDate(newDate.getDate() + dx);
    newDate = calcDateRange(newDate, dx>0?1:-1).end;
    if (newDate !== dateRangeEnd && !(newDate < minEndDate)) {
      setDateRangeEnd(newDate);
    }
  }

  return (
    <Router basename="/covid19">
      <div className="App"> 
        <div className="main-content">

          <Suspense fallback={<Loading>Loading...</Loading>}>
          <Switch>
            <Route path="/town/:town_no">  
              <TownDetails/>
            </Route>
            <Route path="/towns">  
              <TownList townList={townList} townListState={townListState} setTownListState={setTownListState} />
            </Route>
            <Route path="/towns-details">  
              <TownFullData townListState={townFullData} setTownListState={setTownFullData} />
            </Route>
            <Route path="/us">
              <UsInfo data={usData} setData={setUsData} />
            </Route>
            <Route path="/towns-map">
              <MapView townList={townList} threeWeekData={threeWeekData} geoData={geoData} onDateRangeChange={handleDateRangeChange}/>
            </Route>
            <Route path="/">
              <StateInfo 
                data={stateData} 
                setData={setStateData} 
                ageGroupData={stateAgeGroupData} 
                setAgeGroupData={setStateAgeGroupData}/>
            </Route>
          </Switch>
          </Suspense>
        </div>
        <div className="footer">
          Data sources:
            <div>
              <a href="https://dev.socrata.com/foundry/data.ct.gov/28fr-iqnx">
                COVID-19 Tests, Cases, and Deaths (By Town)
              </a>
            </div>
            <div>
              <a href="https://dev.socrata.com/foundry/data.ct.gov/rf3k-f8fg">
                COVID-19 Tests, Cases, Hospitalizations, and Deaths (Statewide)
              </a>
            </div>
            <div>
              <a href="https://dev.socrata.com/foundry/data.ct.gov/ypz6-8qyf">
                COVID-19 Cases and Deaths by Age Group
              </a>
            </div>
            <div>
              <a href="https://covidtracking.com/data/national">
                US Historical Data
              </a>
            </div>
            Source code: <a href="https://github.com/mlovell4/connecticutCovid">https://github.com/mlovell4/connecticutCovid</a>          
        </div>
      </div>
    </Router>
  );
}

export default App;
