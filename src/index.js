import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import jsSHA from 'jssha'


function getAuthHeader() {
	// is this how i'm meant to do it
	var time = new Date().toGMTString()
	var shaObj = new jsSHA('SHA-1', 'TEXT')
	// console.log(process.env.REACT_APP_ID)
	shaObj.setHMACKey(process.env.REACT_APP_KEY, 'TEXT')
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
			info: ""
		}
	}

	componentDidMount() {
		var top = this;
		fetch("http://ptx.transportdata.tw/MOTC/v2/Rail/TRA/LiveBoard?$filter=StationID%20eq%20'1011'&$format=JSON", {
			method: 'get',
			headers: new Headers({
				'Authorization': getAuthHeader()
			})
		}).then(response => response.json())
		.then(function(data) {
			console.log(data)
			let stns = []
			
			
		
			// top.setState({stations: stns, searchResults: stns})
		})
	}


	render() {
		if (this.props.display) {
			return null
		} else {
			return (<div>Eeep</div>)	
		}
		
	}


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

		if (obj.StationID === this.state.selected) {
			this.setState({
				selected: ""
			})
		} else {

			this.setState({
			selected: obj.StationID
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
			isSelected={obj.StationID === this.state.selected}
			/>
			)
	}

	render() {
		return (
			<div class="main">
			<div class="infobar"><StationInfo key={1011} display={this.state.selected===""}/></div>
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