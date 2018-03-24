import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import jsSHA from 'jssha'

function header() {
	return(<h1 class="header">transit</h1>);
}

function Search(props) {
	return(<input type="text" placeholder="Search..." class="search" onkeyup={() => this.props.onKeyUp()}/>)
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

class App extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			searchEntry: "",
			stations: []
		}
	}

	componentDidMount() {
		var top = this;
		fetch('http://ptx.transportdata.tw/MOTC/v2/Rail/THSR/Station?$top=30&$format=json', {
			method: 'get',
			headers: new Headers({
				'Authorization': getAuthHeader()
			})
		}).then(response => response.json())
		.then(function(data) {
			// console.log(data)
			let cars = []
			for (var station in data) {
				let stnName = data[station]["StationName"]["En"]
				cars.push(stnName)
			}
		
			top.setState({stations: cars})
		})
	}


	handleClick(text) {
		// authHeader = getAuthHeader()
		

		this.setState({
			searchEntry: text
		})

		
	}





	render() {
		return (
			<div>
			{header()}
			<Search onKeyUp={text => this.handleClick(text)}/>
			{this.state.stations.map(station => {
				return (<div>{station}</div>)
			})}
			</div>

			)
	}
}

ReactDOM.render(<App />, document.getElementById('root'))