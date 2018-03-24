import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import jsSHA from 'jssha'

function header() {
	return(<h1 class="header">transit</h1>);
}


function getAuthHeader() {
	// is this how i'm meant to do it
	var time = new Date().toGMTString()
	var shaObj = new jsSHA('SHA-1', 'TEXT')
	// console.log(process.env.REACT_APP_ID)
	shaObj.setHMACKey(process.env.REACT_APP_KEY, 'TEXT')
	shaObj.update('x-date: ' + time)
	var HMAC = shaObj.getHMAC('B64')
	var auth = 'hmac username=\"' + process.env.REACT_APP_ID + '\", algorithm=\"hmac-sha1\", headers=\"x-date\", signature=\"' + HMAC + '\"'

	return { 'Authorization': "Authorization", 'X-Date': time /*,'Accept-Encoding': 'gzip'*/}
}

function station(n) {
	// return(<div><span class="stationName">{n}</span></div>)
	return(
		<button class="card">
			<div class="station-container">
				{n}
			</div>
		</button>
		)
}

// TO DO: Allow clicking on buttons to show schedule or something


class App extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			searchEntry: "",
			stations: [],
			searchResults: [],
			isEnglish: true
		}
		this.handleChange= this.handleChange.bind(this)
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


	handleClick(text) {
		this.setState({
			searchEntry: text
		})	
	}

	toggleLanguage() {
		if (this.state.isEnglish) {
			this.setState({isEnglish: false})
		} else {
			this.setState({isEnglish: true})
		}
	}






	render() {
		return (
			<div>
			
			<input type="text" placeholder="Search..." class="search" onChange={this.handleChange} value={this.state.searchEntry}/>
			<button class="langToggle" onClick={() => this.toggleLanguage()}>
				{this.state.isEnglish ? "en" : "zh"}
			</button>
			{this.state.searchResults.map(stn => {
				if (this.state.isEnglish) {
					return (station(stn.StationName.En))
				} else {
					return (station(stn.StationName.Zh_tw))
				}
			})}
			
			</div>

			)
	}
}

ReactDOM.render(<App />, document.getElementById('root'))