import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import jsSHA from 'jssha'
import moment from 'moment'


function getAuthHeader() {
	// is this how i'm meant to do it
	var time = new Date().toGMTString()
	var shaObj = new jsSHA('SHA-1', 'TEXT')
	// console.log(process.env.REACT_APP_ID)
	shaObj.setHMACKey(process.env.REACT_APP_KEY, 'TEXT')
	console.log(process.env.REACT_APP_KEY)
	shaObj.update('x-date: ' + time)
	var HMAC = shaObj.getHMAC('B64')
	var auth = 'hmac username=' + process.env.REACT_APP_ID + ', algorithm=hmac-sha1, headers=x-date, signature=' + HMAC

	return { 'Authorization': "Authorization", 'X-Date': time /*,'Accept-Encoding': 'gzip'*/}
}


// TO DO: Allow clicking on buttons to show schedule or something

class StationInfo extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			realtime: []
		}
	}

	componentDidMount() {
		var top = this;
		let url = "http://ptx.transportdata.tw/MOTC/v2/Rail/TRA/LiveBoard?$filter=StationID%20eq%20'" + this.props.station.StationID+ "'&$format=JSON"
		console.log(url)
		fetch(url, {
			method: 'get',
			headers: new Headers({
				'Authorization': getAuthHeader()
			})
		}).then(response => response.json())
		.then(function(data) {
			console.log(data)
			let rtb = []
			for (var rt in data) {
				rtb.push(data[rt])
			}
			top.setState({realtime: rtb})
		})
	}

	shouldComponentUpdate(nextProps, nextState) {
		console.log("it should")
		console.log("states equality: " + this.state === nextState)
		console.log("props equality: " + this.props.station === nextProps.station)
		return this.props.station !== nextProps.station
		// TODO: MAKE SURE WE DONT KEEP RENDERING!!!! then we can get stuff
	}

	componentWillUpdate() {
		var top = this;
		let url = "http://ptx.transportdata.tw/MOTC/v2/Rail/TRA/LiveBoard?$filter=StationID%20eq%20'" + this.props.station.StationID+ "'&$format=JSON"
		console.log(url)
		fetch(url, {
			method: 'get',
			headers: new Headers({
				'Authorization': getAuthHeader()
			})
		}).then(response => response.json())
		.then(function(data) {
			let rtb = []
			for (var rt in data) {
				rtb.push(data[rt])
			}
			top.setState({realtime: rtb})
			console.log("setting states")
			console.log(top.state.realtime)
		})
	}

	renderEntry(obj) {
		return <TimeBlock key={obj.TrainNo} train={obj}/>
	}


	render() {
		if (this.props.display) {

				return (<div class="infobar">
				<div>{this.props.station.StationName.En}
				{this.state.realtime.map(
				(object, i) => this.renderEntry(object)
				)}</div>
				</div>)	
			


		} else {
			return null
		}
		
	}


}

function TimeBlock(props) {
	const details = props.train
	
	const leaveTime = moment(details.ScheduledDepartureTime, "hh:mm:ss").format("hh:mm")
	const destinationEn = details.EndingStationName.En
	const destinationZh_tw = details.EndingStationName.Zh_tw
	const delay = details.DelayTime
	return(<div class="time">{destinationEn}<span class="train-time">{leaveTime}</span> <span class="train-delay"> +{delay}</span></div>)
}

function Station(props) {

	const isEnglish = props.isEnglish
	const stationDetails = props.station
	if (isEnglish) {
		return (<button className={props.isSelected ? "card selected" : "card"} onClick={props.onClick}>
			<div class="station-container">
				{stationDetails.StationName.En}
			</div>
				
		</button>)
	} else {
		return (<button className={props.isSelected ? "card selected" : "card"}  onClick={props.onClick}>
			<div class="station-container">
				{stationDetails.StationName.Zh_tw}
			</div>
				
		</button>)
	}
}



class App extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			searchEntry: "",
			stations: [],
			searchResults: [],
			isEnglish: true,
			selected: ""
		}
		this.handleChange= this.handleChange.bind(this)
		this.handleClick = this.handleClick.bind(this)
		this.renderStation = this.renderStation.bind(this)
	}


	handleChange(e) {
		this.setState({
			searchEntry: e.target.value
		})
		if (e.target.value) {
			let results = []
			for (var stn in this.state.stations) {
				let currentStn = this.state.stations[stn]
				if (currentStn["StationName"]["En"].toLowerCase().startsWith(e.target.value.toLowerCase().trim()) || currentStn["StationName"]["Zh_tw"].startsWith(e.target.value)) {
					// console.log(currentStn)
					results.push(currentStn)
				}
			}
			this.setState({
				searchResults: results
			})
		} else {
			this.setState({
				searchResults: this.state.stations
			})
		}
	}

	componentDidMount() {
		var top = this;
		fetch('http://ptx.transportdata.tw/MOTC/v2/Rail/TRA/Station?$orderby=StationID&$format=JSON', {
			method: 'get',
			headers: new Headers({
				'Authorization': getAuthHeader()
			})
		}).then(response => response.json())
		.then(function(data) {
			// console.log(data)
			let stns = []
			for (var station in data) {
				let stn = data[station]
				stns.push(stn)

			}
			
		
			top.setState({stations: stns, searchResults: stns})
		})
	}


	handleClick(obj) {
		console.log(obj.StationID)

		if (obj.StationID === this.state.selected.StationID) {
			this.setState({
				selected: ""
			})
		} else {

			this.setState({
			selected: obj
		})
		}

		
	}

	toggleLanguage() {
		if (this.state.isEnglish) {
			this.setState({isEnglish: false})
		} else {
			this.setState({isEnglish: true})
		}
	}

	renderStation(obj) {
		return (
			<Station key={obj.StationID} 
			station={obj} 
			isEnglish={this.state.isEnglish} 
			onClick={() => this.handleClick(obj)}
			isSelected={obj.StationID === this.state.selected.StationID}
			/>
			)
	}

	render() {
		return (
			<div class="main">
			<StationInfo station={this.state.selected} isEnglish={this.state.isEnglish} display={this.state.selected!==""}/>
			<input type="text" placeholder="Search..."  className={this.state.selected!=="" ? "search selected": "search"} onChange={this.handleChange} value={this.state.searchEntry}/>
			<button class="langToggle" onClick={() => this.toggleLanguage()}>
				{this.state.isEnglish ? "en" : "zh"}
			</button>
			{this.state.searchResults.map(
				(object, i) => this.renderStation(object)
				)}
			
			</div>

			)
	}
}

ReactDOM.render(<App />, document.getElementById('root'))