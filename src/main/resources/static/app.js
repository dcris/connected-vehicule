var stompClient = null;
// Driver 1 
var driver1_map = null;
var driver1_marker = null;
var driver1_path = null;
var driver1_temp_coordinates = [];
var driver1_drive_step = 0.0004
var driver1_delivering = false;
var driver1_stopped = false;
var driver1_accident = false;

// Driver 2 
var driver2_map = null;
var driver2_marker = null;
var driver2_path = null;
var driver2_temp_coordinates = [];
var driver2_drive_step = 0.0004;
var driver2_delivering = false;
var driver2_stopped = false;
var driver2_accident = false;

// Driver 3 
var driver3_map = null;
var driver3_marker = null;
var driver3_path = null;
var driver3_temp_coordinates = [];
var driver3_drive_step = 0.0004;
var driver3_delivering = false;
var driver3_stopped = false;
var driver3_accident = false;

// Driver 4 
var driver4_map = null;
var driver4_marker = null;
var driver4_path = null;
var driver4_temp_coordinates = [];
var driver4_drive_step = 0.0004;
var driver4_delivering = false;
var driver4_stopped = false;
var driver4_accident = false;

// Driver 5 
var driver5_map = null;
var driver5_marker = null;
var driver5_path = null;
var driver5_temp_coordinates = [];
var driver5_drive_step = 0.0004;
var driver5_delivering = false;
var driver5_stopped = false;
var driver5_accident = false;

// Driver 6 
var driver6_map = null;
var driver6_marker = null;
var driver6_path = null;
var driver6_temp_coordinates = [];
var driver6_drive_step = 0.0004;
var driver6_delivering = false;
var driver6_stopped = false;
var driver6_accident = false;

// Styling for the line on the map
var drive_line_paint = {
	'line-width': 2,
	"line-gradient" : [
		'interpolate',
		['linear'],
		['line-progress'],
		0, "#D9497D",
		0.5, "#EA6053",
		1, "#F97C24"
	]
}

function connect() {
    var socket = new SockJS('/gs-guide-websocket');
    stompClient = Stomp.over(socket);
    stompClient.connect({}, function (frame) {
		renderMapDriver1();
		renderMapDriver2();
		renderMapDriver3();
		renderMapDriver4();
		renderMapDriver5();
		renderMapDriver6();
		
		addEventListenerDriver1();
		addEventListenerDriver2();
		addEventListenerDriver3();
		addEventListenerDriver4();
		addEventListenerDriver5();
		addEventListenerDriver6();
        /*stompClient.subscribe('/topic/info', function (greeting) {

        });*/
        
    });
}

function sendName() {
    stompClient.send("/app/track", {}, "Hello, STOMP");
}

function showGreeting(message) {
    $("#greetings").append("<tr><td>" + message + "</td></tr>");
}

document.addEventListener('DOMContentLoaded', function(event){
	mapboxgl.accessToken = 'pk.eyJ1IjoiYWxmcmVkb3dvbmEiLCJhIjoiY2w3c3M1NHVoMHM2MDNxcDJ5Z3JrYzRpaCJ9.iJBu83MKVgJzQEFvVdk9zw';
	
	connect();
});


/*-----------------------------------------------------------------------*/
/*                                                                       */
/*                             DRIVER 1                                  */
/*                                                                       */
/*-----------------------------------------------------------------------*/

function renderMapDriver1(){
	var origin = [2.293884, 48.859322];
	var destination = [2.295642, 48.874198];
	
	driver1_map = new mapboxgl.Map({
		container: 'driver1_map',
		style: 'mapbox://styles/mapbox/streets-v11',
		center: origin,
		zoom: 16
	});
 
	driver1_map.on('style.load', () => {
		driver1_map.setFog({}); // Set the default atmosphere style
	});
	const el = document.createElement('div');
	el.className = 'truck1_martker';
	driver1_marker = new mapboxgl.Marker(el)
		.setLngLat(origin)
		.addTo(driver1_map);

    driver1_map.on('load', function () {
  		sw = new mapboxgl.LngLat(origin[0], origin[1]);
		ne = new mapboxgl.LngLat(destination[0], destination[1]);
		llb = new mapboxgl.LngLatBounds(sw, ne);
		driver1_map.fitBounds(llb, {
		    padding: 100,
		    linear: true
		  });

		driver1_getRoute(origin, destination);
        
    });
}

async function driver1_getRoute(start, end) {
	const query = await fetch(
		`https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&overview=full&access_token=${mapboxgl.accessToken}`,
		{ method: 'GET' }
	);
	var data = await query.json();
	driver1_path = data.routes[0].geometry.coordinates;
	driver1_path = turf.linestring(driver1_path);
	
	driver1_drawRoute();
}

function driver1_drawRoute () {
	
	//pathLength = turf.lineDistance(path, 'miles')
	//steps=Math.floor(pathLength/drive_step)
	if(driver1_delivering || driver1_stopped || driver1_accident) {
		driver1_drive_step = driver1_drive_step;
	} else {
		driver1_drive_step = driver1_drive_step + Math.random()/10000;
	}
	
	nextPoint= turf.along(driver1_path, driver1_drive_step , 'miles')
	driver1_temp_coordinates.push( nextPoint.geometry.coordinates )
	
	stompClient.send("/app/track", {}, JSON.stringify({'driverID': 'driver1', coordinate: nextPoint.geometry.coordinates}));
	
	driver1_marker.setLngLat(nextPoint.geometry.coordinates);
	driver1_map.flyTo({
		center: nextPoint.geometry.coordinates,
		zoom: 17,
		essential: true // this animation is considered essential with respect to prefers-reduced-motion
	});
	
	geojson = {
		type: 'Feature',
		geometry: {
			type: "LineString",
			coordinates: driver1_temp_coordinates
		}
	}
	
	if (driver1_map.getSource('route')) {
	    driver1_map.getSource('route').setData(geojson);
	 }
	  // otherwise, we'll make a new request
	else {
	    driver1_map.addLayer({
		      id: 'route',
		      type: 'line',
		      source: {
		        type: 'geojson',
		        data: geojson
		      },
		      layout: {
		        'line-join': 'round',
		        'line-cap': 'round'
		      },
		      paint: {
		        'line-color': '#3887be',
		        'line-width': 5,
		        'line-opacity': 0.75
		  	  }
	  	  });
	}

	if(!driver1_accident && (driver1_temp_coordinates[driver1_temp_coordinates.length-1][1] !=2.295642 || driver1_temp_coordinates[driver1_temp_coordinates.length-1][0] != 48.874198)) {
		  requestAnimationFrame(driver1_drawRoute);
	}	 
}

function addEventListenerDriver1(){
	document.getElementById("driver1_delivered").addEventListener("click", function(event) {
		if(!driver1_delivering && !driver1_stopped && !driver1_accident) {
			driver1_delivering = true;
			const el = document.createElement('div');
			el.className = 'delivery_martker';
	  		// make a marker for each feature and add to the map
	  		var coordinate = driver1_temp_coordinates[driver1_temp_coordinates.length-1];
			var delivery_marker = new mapboxgl.Marker(el).setLngLat(coordinate).addTo(driver1_map);
			deliveringDriver1(true, coordinate, delivery_marker);
		}
	});
	
	document.getElementById('driver1_not_delivered').addEventListener("click", function(event) {	
		if(!driver1_delivering && !driver1_stopped && !driver1_accident) {
			driver1_delivering = true;
			const el = document.createElement('div');
			el.className = 'delivery_martker';
	  		// make a marker for each feature and add to the map
	  		var coordinate = driver1_temp_coordinates[driver1_temp_coordinates.length-1];
			var delivery_marker = new mapboxgl.Marker(el).setLngLat(driver1_temp_coordinates[driver1_temp_coordinates.length-1]).addTo(driver1_map);
			deliveringDriver1(false, coordinate, delivery_marker);
		}
	});
	
	document.getElementById('driver1_stopped').addEventListener("click", function(event) {
		if(!driver1_delivering && !driver1_stopped && !driver1_accident) {
			driver1_stopped = true;
			const el = document.createElement('div');
			el.className = 'stopped_martker';
	  		// make a marker for each feature and add to the map
			new mapboxgl.Marker(el).setLngLat(driver1_temp_coordinates[driver1_temp_coordinates.length-1]).addTo(driver1_map);
			stoppedDriver1();
		}
	});
	
	document.getElementById('driver1_accident').addEventListener("click", function(event) {
		if(!driver1_delivering && !driver1_stopped && !driver1_accident) {
			driver1_accident = true;
			const el = document.createElement('div');
			el.className = 'accident_martker';
	  		// make a marker for each feature and add to the map
			new mapboxgl.Marker(el).setLngLat(driver1_temp_coordinates[driver1_temp_coordinates.length-1]).addTo(driver1_map);
		}
	});
}

async function deliveringDriver1(success, coordinate, delivery_marker) {
	stompClient.send("/app/delivering", {}, JSON.stringify({'driverID': 'driver1', coordinate: nextPoint.geometry.coordinates, delivering: true}));
	var millisecondsToWait = Math.floor(Math.random() * 100001);
	setTimeout(function() {
		delivery_marker.remove();
		const el = document.createElement('div');
		if(success) {
			el.className = 'delivered_martker';
		} else {
			el.className = 'delivery_failure_martker';
		}
		
  		// make a marker for each feature and add to the map
		new mapboxgl.Marker(el).setLngLat(coordinate).addTo(driver1_map);
		stompClient.send("/app/delivery_status", {}, JSON.stringify({'driverID': 'driver1', coordinate: nextPoint.geometry.coordinates, delivered: success, timeSpent: millisecondsToWait}));
	    driver1_delivering = false;
	}, millisecondsToWait);
}

async function stoppedDriver1() {
	var millisecondsToWait = Math.floor(Math.random() * 100001);
	setTimeout(function() {
	    driver1_stopped = false;
	}, millisecondsToWait);
}

/*-----------------------------------------------------------------------*/
/*                                                                       */
/*                             DRIVER 2                                  */
/*                                                                       */
/*-----------------------------------------------------------------------*/

function renderMapDriver2(){
	var origin = [2.322423,48.841139];
	var destination = [2.365265,48.864840];
	
	driver2_map = new mapboxgl.Map({
		container: 'driver2_map',
		style: 'mapbox://styles/mapbox/streets-v11',
		center: origin,
		zoom: 16
	});
 
	driver2_map.on('style.load', () => {
		driver2_map.setFog({}); // Set the default atmosphere style
	});
	
	const el = document.createElement('div');
	el.className = 'truck2_martker';
	driver2_marker = new mapboxgl.Marker(el)
		.setLngLat(origin)
		.addTo(driver2_map);

    driver2_map.on('load', function () {
  		sw = new mapboxgl.LngLat(origin[0], origin[1]);
		ne = new mapboxgl.LngLat(destination[0], destination[1]);
		llb = new mapboxgl.LngLatBounds(sw, ne);
		driver2_map.fitBounds(llb, {
		    padding: 100,
		    linear: true
		  });

		driver2_getRoute(origin, destination);
        
    });
}

async function driver2_getRoute(start, end) {
	const query = await fetch(
		`https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&overview=full&access_token=${mapboxgl.accessToken}`,
		{ method: 'GET' }
	);
	var data = await query.json();
	driver2_path = data.routes[0].geometry.coordinates;
	driver2_path = turf.linestring(driver2_path);
	
	driver2_drawRoute();
}

function driver2_drawRoute () {
	
	//pathLength = turf.lineDistance(path, 'miles')
	//steps=Math.floor(pathLength/drive_step)
	if(driver2_delivering || driver2_stopped || driver2_accident) {
		driver2_drive_step = driver2_drive_step;
	} else {
		driver2_drive_step = driver2_drive_step + Math.random()/10000;
	}
	nextPoint= turf.along(driver2_path, driver2_drive_step , 'miles')
	driver2_temp_coordinates.push( nextPoint.geometry.coordinates )
	
	stompClient.send("/app/track", {}, JSON.stringify({'driverID': 'driver2', coordinate: nextPoint.geometry.coordinates}));
	
	driver2_marker.setLngLat(nextPoint.geometry.coordinates);
	driver2_map.flyTo({
		center: nextPoint.geometry.coordinates,
		zoom: 17,
		essential: true // this animation is considered essential with respect to prefers-reduced-motion
	});
	
	geojson = {
		type: 'Feature',
		geometry: {
			type: "LineString",
			coordinates: driver2_temp_coordinates
		}
	}
	
	if (driver2_map.getSource('route')) {
	    driver2_map.getSource('route').setData(geojson);
	 }
	  // otherwise, we'll make a new request
	else {
	    driver2_map.addLayer({
		      id: 'route',
		      type: 'line',
		      source: {
		        type: 'geojson',
		        data: geojson
		      },
		      layout: {
		        'line-join': 'round',
		        'line-cap': 'round'
		      },
		      paint: {
		        'line-color': '#3887be',
		        'line-width': 5,
		        'line-opacity': 0.75
		  	  }
	  	  });
	}

	if(!driver2_accident && (driver2_temp_coordinates[driver2_temp_coordinates.length-1][1] !=2.365265 || driver2_temp_coordinates[driver2_temp_coordinates.length-1][0] != 48.864840)) {
		  requestAnimationFrame(driver2_drawRoute);
	}	 
}

function addEventListenerDriver2(){
	document.getElementById("driver2_delivered").addEventListener("click", function(event) {
		if(!driver2_delivering && !driver2_stopped && !driver2_accident) {
			driver2_delivering = true;
			const el = document.createElement('div');
			el.className = 'delivery_martker';
	  		// make a marker for each feature and add to the map
	  		var coordinate = driver2_temp_coordinates[driver2_temp_coordinates.length-1];
			var delivery_marker = new mapboxgl.Marker(el).setLngLat(coordinate).addTo(driver2_map);
			deliveringDriver2(true, coordinate, delivery_marker);
		}
	});
	
	document.getElementById('driver2_not_delivered').addEventListener("click", function(event) {	
		if(!driver2_delivering && !driver2_stopped && !driver2_accident) {
			driver2_delivering = true;
			const el = document.createElement('div');
			el.className = 'delivery_martker';
	  		// make a marker for each feature and add to the map
	  		var coordinate = driver2_temp_coordinates[driver2_temp_coordinates.length-1];
			var delivery_marker = new mapboxgl.Marker(el).setLngLat(driver2_temp_coordinates[driver2_temp_coordinates.length-1]).addTo(driver2_map);
			deliveringDriver2(false, coordinate, delivery_marker);
		}
	});
	
	document.getElementById('driver2_stopped').addEventListener("click", function(event) {
		if(!driver2_delivering && !driver2_stopped && !driver2_accident) {
			driver2_stopped = true;
			//<a href="https://www.flaticon.com/free-icons/truck" title="truck icons">Truck icons created by Freepik - Flaticon</a>
			const el = document.createElement('div');
			el.className = 'stopped_martker';
	  		// make a marker for each feature and add to the map
			new mapboxgl.Marker(el).setLngLat(driver2_temp_coordinates[driver2_temp_coordinates.length-1]).addTo(driver2_map);
			stoppedDriver2();
		}
	});
	
	document.getElementById('driver2_accident').addEventListener("click", function(event) {
		if(!driver2_delivering && !driver2_stopped && !driver2_accident) {
			driver2_accident = true;
			const el = document.createElement('div');
			el.className = 'accident_martker';
	  		// make a marker for each feature and add to the map
			new mapboxgl.Marker(el).setLngLat(driver2_temp_coordinates[driver2_temp_coordinates.length-1]).addTo(driver2_map);
		}
	});
}

async function deliveringDriver2(success, coordinate, delivery_marker) {
	stompClient.send("/app/delivering", {}, JSON.stringify({'driverID': 'driver2', coordinate: nextPoint.geometry.coordinates, delivering: true}));
	var millisecondsToWait = Math.floor(Math.random() * 100001);
	setTimeout(function() {
		delivery_marker.remove();
		const el = document.createElement('div');
		if(success) {
			el.className = 'delivered_martker';
		} else {
			el.className = 'delivery_failure_martker';
		}
		
  		// make a marker for each feature and add to the map
		new mapboxgl.Marker(el).setLngLat(coordinate).addTo(driver2_map);
		stompClient.send("/app/delivery_status", {}, JSON.stringify({'driverID': 'driver2', coordinate: nextPoint.geometry.coordinates, delivered: success, timeSpent: millisecondsToWait}));
	    driver2_delivering = false;
	}, millisecondsToWait);
}

async function stoppedDriver2() {
	var millisecondsToWait = Math.floor(Math.random() * 100001);
	setTimeout(function() {
	    driver2_stopped = false;
	}, millisecondsToWait);
}

/*-----------------------------------------------------------------------*/
/*                                                                       */
/*                             DRIVER 3                                  */
/*                                                                       */
/*-----------------------------------------------------------------------*/

function renderMapDriver3(){
	var origin = [2.382538,48.843594];
	var destination = [2.344833,48.890827];
	
	driver3_map = new mapboxgl.Map({
		container: 'driver3_map',
		style: 'mapbox://styles/mapbox/streets-v11',
		center: origin,
		zoom: 16
	});
 
	driver3_map.on('style.load', () => {
		driver3_map.setFog({}); // Set the default atmosphere style
	});
	
	const el = document.createElement('div');
	el.className = 'truck3_martker';
	driver3_marker = new mapboxgl.Marker(el)
		.setLngLat(origin)
		.addTo(driver3_map);

    driver3_map.on('load', function () {
  		sw = new mapboxgl.LngLat(origin[0], origin[1]);
		ne = new mapboxgl.LngLat(destination[0], destination[1]);
		llb = new mapboxgl.LngLatBounds(sw, ne);
		driver3_map.fitBounds(llb, {
		    padding: 100,
		    linear: true
		  });

		driver3_getRoute(origin, destination);
        
    });
}

async function driver3_getRoute(start, end) {
	const query = await fetch(
		`https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&overview=full&access_token=${mapboxgl.accessToken}`,
		{ method: 'GET' }
	);
	var data = await query.json();
	driver3_path = data.routes[0].geometry.coordinates;
	driver3_path = turf.linestring(driver3_path);
	
	driver3_drawRoute();
}

function driver3_drawRoute () {
	
	//pathLength = turf.lineDistance(path, 'miles')
	//steps=Math.floor(pathLength/drive_step)
	if(driver3_delivering || driver3_stopped || driver3_accident) {
		driver3_drive_step = driver3_drive_step;
	} else {
		driver3_drive_step = driver3_drive_step + Math.random()/10000;
	}
	nextPoint= turf.along(driver3_path, driver3_drive_step , 'miles')
	driver3_temp_coordinates.push( nextPoint.geometry.coordinates )
	
	stompClient.send("/app/track", {}, JSON.stringify({'driverID': 'driver3', coordinate: nextPoint.geometry.coordinates}));
	
	driver3_marker.setLngLat(nextPoint.geometry.coordinates);
	driver3_map.flyTo({
		center: nextPoint.geometry.coordinates,
		zoom: 17,
		essential: true // this animation is considered essential with respect to prefers-reduced-motion
	});
	
	geojson = {
		type: 'Feature',
		geometry: {
			type: "LineString",
			coordinates: driver3_temp_coordinates
		}
	}
	
	if (driver3_map.getSource('route')) {
	    driver3_map.getSource('route').setData(geojson);
	 }
	  // otherwise, we'll make a new request
	else {
	    driver3_map.addLayer({
		      id: 'route',
		      type: 'line',
		      source: {
		        type: 'geojson',
		        data: geojson
		      },
		      layout: {
		        'line-join': 'round',
		        'line-cap': 'round'
		      },
		      paint: {
		        'line-color': '#3887be',
		        'line-width': 5,
		        'line-opacity': 0.75
		  	  }
	  	  });
	} 

	if(!driver3_accident && (driver3_temp_coordinates[driver3_temp_coordinates.length-1][1] !=2.344833 || driver3_temp_coordinates[driver3_temp_coordinates.length-1][0] != 48.890827)) {
		  requestAnimationFrame(driver3_drawRoute);
	}	 
}

function addEventListenerDriver3(){
	document.getElementById("driver3_delivered").addEventListener("click", function(event) {
		if(!driver3_delivering && !driver3_stopped && !driver3_accident) {
			driver3_delivering = true;
			const el = document.createElement('div');
			el.className = 'delivery_martker';
	  		// make a marker for each feature and add to the map
	  		var coordinate = driver3_temp_coordinates[driver3_temp_coordinates.length-1];
			var delivery_marker = new mapboxgl.Marker(el).setLngLat(coordinate).addTo(driver3_map);
			deliveringDriver3(true, coordinate, delivery_marker);
		}
	});
	
	document.getElementById('driver3_not_delivered').addEventListener("click", function(event) {	
		if(!driver3_delivering && !driver3_stopped && !driver3_accident) {
			driver3_delivering = true;
			const el = document.createElement('div');
			el.className = 'delivery_martker';
	  		// make a marker for each feature and add to the map
	  		var coordinate = driver3_temp_coordinates[driver3_temp_coordinates.length-1];
			var delivery_marker = new mapboxgl.Marker(el).setLngLat(driver3_temp_coordinates[driver3_temp_coordinates.length-1]).addTo(driver3_map);
			deliveringDriver3(false, coordinate, delivery_marker);
		}
	});
	
	document.getElementById('driver3_stopped').addEventListener("click", function(event) {
		if(!driver3_delivering && !driver3_stopped && !driver3_accident) {
			driver3_stopped = true;
			const el = document.createElement('div');
			el.className = 'stopped_martker';
	  		// make a marker for each feature and add to the map
			new mapboxgl.Marker(el).setLngLat(driver3_temp_coordinates[driver3_temp_coordinates.length-1]).addTo(driver3_map);
			stoppedDriver3();
		}
	});
	
	document.getElementById('driver3_accident').addEventListener("click", function(event) {
		if(!driver3_delivering && !driver3_stopped && !driver3_accident) {
			driver3_accident = true;
			const el = document.createElement('div');
			el.className = 'accident_martker';
	  		// make a marker for each feature and add to the map
			new mapboxgl.Marker(el).setLngLat(driver3_temp_coordinates[driver3_temp_coordinates.length-1]).addTo(driver3_map);
		}
	});
}

async function deliveringDriver3(success, coordinate, delivery_marker) {
	stompClient.send("/app/delivering", {}, JSON.stringify({'driverID': 'driver3', coordinate: nextPoint.geometry.coordinates, delivering: true}));
	var millisecondsToWait = Math.floor(Math.random() * 100001);
	setTimeout(function() {
		delivery_marker.remove();
		const el = document.createElement('div');
		if(success) {
			el.className = 'delivered_martker';
		} else {
			el.className = 'delivery_failure_martker';
		}
		
  		// make a marker for each feature and add to the map
		new mapboxgl.Marker(el).setLngLat(coordinate).addTo(driver3_map);
		stompClient.send("/app/delivery_status", {}, JSON.stringify({'driverID': 'driver3', coordinate: nextPoint.geometry.coordinates, delivered: success, timeSpent: millisecondsToWait}));
	    driver3_delivering = false;
	}, millisecondsToWait);
}

async function stoppedDriver3() {
	var millisecondsToWait = Math.floor(Math.random() * 100001);
	setTimeout(function() {
	    driver3_stopped = false;
	}, millisecondsToWait);
}

/*-----------------------------------------------------------------------*/
/*                                                                       */
/*                             DRIVER 4                                  */
/*                                                                       */
/*-----------------------------------------------------------------------*/

function renderMapDriver4(){
	var origin = [2.276112,48.882326];
	var destination = [2.302839,48.838729];
	
	driver4_map = new mapboxgl.Map({
		container: 'driver4_map',
		style: 'mapbox://styles/mapbox/streets-v11',
		center: origin,
		zoom: 16
	});
 
	driver4_map.on('style.load', () => {
		driver4_map.setFog({}); // Set the default atmosphere style
	});
	
	const el = document.createElement('div');
	el.className = 'truck4_martker';
	driver4_marker = new mapboxgl.Marker(el)
		.setLngLat(origin)
		.addTo(driver4_map);

    driver4_map.on('load', function () {
  		sw = new mapboxgl.LngLat(origin[0], origin[1]);
		ne = new mapboxgl.LngLat(destination[0], destination[1]);
		llb = new mapboxgl.LngLatBounds(sw, ne);
		driver4_map.fitBounds(llb, {
		    padding: 100,
		    linear: true
		  });

		driver4_getRoute(origin, destination);
        
    });
}

async function driver4_getRoute(start, end) {
	const query = await fetch(
		`https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&overview=full&access_token=${mapboxgl.accessToken}`,
		{ method: 'GET' }
	);
	var data = await query.json();
	driver4_path = data.routes[0].geometry.coordinates;
	driver4_path = turf.linestring(driver4_path);
	
	driver4_drawRoute();
}

function driver4_drawRoute () {
	
	//pathLength = turf.lineDistance(path, 'miles')
	//steps=Math.floor(pathLength/drive_step)
	if(driver4_delivering || driver4_stopped || driver4_accident) {
		driver4_drive_step = driver4_drive_step;
	} else {
		driver4_drive_step = driver4_drive_step + Math.random()/10000;
	}
	nextPoint= turf.along(driver4_path, driver4_drive_step , 'miles')
	driver4_temp_coordinates.push( nextPoint.geometry.coordinates )
	
	stompClient.send("/app/track", {}, JSON.stringify({'driverID': 'driver4', coordinate: nextPoint.geometry.coordinates}));
	
	driver4_marker.setLngLat(nextPoint.geometry.coordinates);
	driver4_map.flyTo({
		center: nextPoint.geometry.coordinates,
		zoom: 17,
		essential: true // this animation is considered essential with respect to prefers-reduced-motion
	});
	
	geojson = {
		type: 'Feature',
		geometry: {
			type: "LineString",
			coordinates: driver4_temp_coordinates
		}
	}
	
	if (driver4_map.getSource('route')) {
	    driver4_map.getSource('route').setData(geojson);
	 }
	  // otherwise, we'll make a new request
	else {
	    driver4_map.addLayer({
		      id: 'route',
		      type: 'line',
		      source: {
		        type: 'geojson',
		        data: geojson
		      },
		      layout: {
		        'line-join': 'round',
		        'line-cap': 'round'
		      },
		      paint: {
		        'line-color': '#3887be',
		        'line-width': 5,
		        'line-opacity': 0.75
		  	  }
	  	  });
	}

	if(!driver4_accident && (driver4_temp_coordinates[driver4_temp_coordinates.length-1][1] !=2.302839 || driver4_temp_coordinates[driver4_temp_coordinates.length-1][0] != 48.838729)) {
		  requestAnimationFrame(driver4_drawRoute);
	}	 
}

function addEventListenerDriver4(){
	document.getElementById("driver4_delivered").addEventListener("click", function(event) {
		if(!driver4_delivering && !driver4_stopped && !driver4_accident) {
			driver4_delivering = true;
			const el = document.createElement('div');
			el.className = 'delivery_martker';
	  		// make a marker for each feature and add to the map
	  		var coordinate = driver4_temp_coordinates[driver4_temp_coordinates.length-1];
			var delivery_marker = new mapboxgl.Marker(el).setLngLat(coordinate).addTo(driver4_map);
			deliveringDriver4(true, coordinate, delivery_marker);
		}
	});
	
	document.getElementById('driver4_not_delivered').addEventListener("click", function(event) {	
		if(!driver4_delivering && !driver4_stopped && !driver4_accident) {
			driver4_delivering = true;
			const el = document.createElement('div');
			el.className = 'delivery_martker';
	  		// make a marker for each feature and add to the map
	  		var coordinate = driver4_temp_coordinates[driver4_temp_coordinates.length-1];
			var delivery_marker = new mapboxgl.Marker(el).setLngLat(driver4_temp_coordinates[driver4_temp_coordinates.length-1]).addTo(driver4_map);
			deliveringDriver4(false, coordinate, delivery_marker);
		}
	});
	
	document.getElementById('driver4_stopped').addEventListener("click", function(event) {
		if(!driver4_delivering && !driver4_stopped && !driver4_accident) {
			driver4_stopped = true;
			const el = document.createElement('div');
			el.className = 'stopped_martker';
	  		// make a marker for each feature and add to the map
			new mapboxgl.Marker(el).setLngLat(driver4_temp_coordinates[driver4_temp_coordinates.length-1]).addTo(driver4_map);
			stoppedDriver4();
		}
	});
	
	document.getElementById('driver4_accident').addEventListener("click", function(event) {
		if(!driver4_delivering && !driver4_stopped && !driver4_accident) {
			driver4_accident = true;
			const el = document.createElement('div');
			el.className = 'accident_martker';
	  		// make a marker for each feature and add to the map
			new mapboxgl.Marker(el).setLngLat(driver4_temp_coordinates[driver4_temp_coordinates.length-1]).addTo(driver4_map);
		}
	});
}

async function deliveringDriver4(success, coordinate, delivery_marker) {
	stompClient.send("/app/delivering", {}, JSON.stringify({'driverID': 'driver4', coordinate: nextPoint.geometry.coordinates, delivering: true}));
	var millisecondsToWait = Math.floor(Math.random() * 100001);
	setTimeout(function() {
		delivery_marker.remove();
		const el = document.createElement('div');
		if(success) {
			el.className = 'delivered_martker';
		} else {
			el.className = 'delivery_failure_martker';
		}
		
  		// make a marker for each feature and add to the map
		new mapboxgl.Marker(el).setLngLat(coordinate).addTo(driver4_map);
		stompClient.send("/app/delivery_status", {}, JSON.stringify({'driverID': 'driver4', coordinate: nextPoint.geometry.coordinates, delivered: success, timeSpent: millisecondsToWait}));
	    driver4_delivering = false;
	}, millisecondsToWait);
}

async function stoppedDriver4() {
	var millisecondsToWait = Math.floor(Math.random() * 100001);
	setTimeout(function() {
	    driver4_stopped = false;
	}, millisecondsToWait);
}

/*-----------------------------------------------------------------------*/
/*                                                                       */
/*                             DRIVER 5                                  */
/*                                                                       */
/*-----------------------------------------------------------------------*/

function renderMapDriver5(){
	var origin = [2.292244,48.796086];
	var destination = [2.222794,48.870243];
	
	driver5_map = new mapboxgl.Map({
		container: 'driver5_map',
		style: 'mapbox://styles/mapbox/streets-v11',
		center: origin,
		zoom: 16
	});
 
	driver5_map.on('style.load', () => {
		driver5_map.setFog({}); // Set the default atmosphere style
	});
	
	const el = document.createElement('div');
	el.className = 'truck5_martker';
	driver5_marker = new mapboxgl.Marker(el)
		.setLngLat(origin)
		.addTo(driver5_map);

    driver5_map.on('load', function () {
  		sw = new mapboxgl.LngLat(origin[0], origin[1]);
		ne = new mapboxgl.LngLat(destination[0], destination[1]);
		llb = new mapboxgl.LngLatBounds(sw, ne);
		driver5_map.fitBounds(llb, {
		    padding: 100,
		    linear: true
		  });

		driver5_getRoute(origin, destination);
        
    });
}

async function driver5_getRoute(start, end) {
	const query = await fetch(
		`https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&overview=full&access_token=${mapboxgl.accessToken}`,
		{ method: 'GET' }
	);
	var data = await query.json();
	driver5_path = data.routes[0].geometry.coordinates;
	driver5_path = turf.linestring(driver5_path);
	
	driver5_drawRoute();
}

function driver5_drawRoute () {
	
	//pathLength = turf.lineDistance(path, 'miles')
	//steps=Math.floor(pathLength/drive_step)
	if(driver5_delivering || driver5_stopped || driver5_accident) {
		driver5_drive_step = driver5_drive_step;
	} else {
		driver5_drive_step = driver5_drive_step + Math.random()/10000;
	}
	nextPoint= turf.along(driver5_path, driver5_drive_step , 'miles')
	driver5_temp_coordinates.push( nextPoint.geometry.coordinates )
	
	stompClient.send("/app/track", {}, JSON.stringify({'driverID': 'driver5', coordinate: nextPoint.geometry.coordinates}));
	
	driver5_marker.setLngLat(nextPoint.geometry.coordinates);
	driver5_map.flyTo({
		center: nextPoint.geometry.coordinates,
		zoom: 17,
		essential: true // this animation is considered essential with respect to prefers-reduced-motion
	});
	
	geojson = {
		type: 'Feature',
		geometry: {
			type: "LineString",
			coordinates: driver5_temp_coordinates
		}
	}
	
	if (driver5_map.getSource('route')) {
	    driver5_map.getSource('route').setData(geojson);
	 }
	  // otherwise, we'll make a new request
	else {
	    driver5_map.addLayer({
		      id: 'route',
		      type: 'line',
		      source: {
		        type: 'geojson',
		        data: geojson
		      },
		      layout: {
		        'line-join': 'round',
		        'line-cap': 'round'
		      },
		      paint: {
		        'line-color': '#3887be',
		        'line-width': 5,
		        'line-opacity': 0.75
		  	  }
	  	  });
	}

	if(!driver5_accident && (driver5_temp_coordinates[driver5_temp_coordinates.length-1][1] !=2.222794 || driver5_temp_coordinates[driver5_temp_coordinates.length-1][0] != 48.870243)) {
		  requestAnimationFrame(driver5_drawRoute);
	}	 
}

function addEventListenerDriver5(){
	document.getElementById("driver5_delivered").addEventListener("click", function(event) {
		if(!driver5_delivering && !driver5_stopped && !driver5_accident) {
			driver5_delivering = true;
			const el = document.createElement('div');
			el.className = 'delivery_martker';
	  		// make a marker for each feature and add to the map
	  		var coordinate = driver5_temp_coordinates[driver5_temp_coordinates.length-1];
			var delivery_marker = new mapboxgl.Marker(el).setLngLat(coordinate).addTo(driver5_map);
			deliveringDriver5(true, coordinate, delivery_marker);
		}
	});
	
	document.getElementById('driver5_not_delivered').addEventListener("click", function(event) {	
		if(!driver5_delivering && !driver5_stopped && !driver5_accident) {
			driver5_delivering = true;
			const el = document.createElement('div');
			el.className = 'delivery_martker';
	  		// make a marker for each feature and add to the map
	  		var coordinate = driver5_temp_coordinates[driver5_temp_coordinates.length-1];
			var delivery_marker = new mapboxgl.Marker(el).setLngLat(driver5_temp_coordinates[driver5_temp_coordinates.length-1]).addTo(driver5_map);
			deliveringDriver5(false, coordinate, delivery_marker);
		}
	});
	
	document.getElementById('driver5_stopped').addEventListener("click", function(event) {
		if(!driver5_delivering && !driver5_stopped && !driver5_accident) {
			driver5_stopped = true;
			const el = document.createElement('div');
			el.className = 'stopped_martker';
	  		// make a marker for each feature and add to the map
			new mapboxgl.Marker(el).setLngLat(driver5_temp_coordinates[driver5_temp_coordinates.length-1]).addTo(driver5_map);
			stoppedDriver5();
		}
	});
	
	document.getElementById('driver5_accident').addEventListener("click", function(event) {
		if(!driver5_delivering && !driver5_stopped && !driver5_accident) {
			driver5_accident = true;
			const el = document.createElement('div');
			el.className = 'accident_martker';
	  		// make a marker for each feature and add to the map
			new mapboxgl.Marker(el).setLngLat(driver5_temp_coordinates[driver5_temp_coordinates.length-1]).addTo(driver5_map);
		}
	});
}

async function deliveringDriver5(success, coordinate, delivery_marker) {
	stompClient.send("/app/delivering", {}, JSON.stringify({'driverID': 'driver5', coordinate: nextPoint.geometry.coordinates, delivering: true}));
	var millisecondsToWait = Math.floor(Math.random() * 100001);
	setTimeout(function() {
		delivery_marker.remove();
		const el = document.createElement('div');
		if(success) {
			el.className = 'delivered_martker';
		} else {
			el.className = 'delivery_failure_martker';
		}
		
  		// make a marker for each feature and add to the map
		new mapboxgl.Marker(el).setLngLat(coordinate).addTo(driver5_map);
		stompClient.send("/app/delivery_status", {}, JSON.stringify({'driverID': 'driver5', coordinate: nextPoint.geometry.coordinates, delivered: success, timeSpent: millisecondsToWait}));
	    driver5_delivering = false;
	}, millisecondsToWait);
}

async function stoppedDriver5() {
	var millisecondsToWait = Math.floor(Math.random() * 100001);
	setTimeout(function() {
	    driver5_stopped = false;
	}, millisecondsToWait);
}

/*-----------------------------------------------------------------------*/
/*                                                                       */
/*                             DRIVER 6                                  */
/*                                                                       */
/*-----------------------------------------------------------------------*/

function renderMapDriver6(){
	var origin = [2.283075,48.893908];
	var destination = [2.214076,48.846782];
	
	driver6_map = new mapboxgl.Map({
		container: 'driver6_map',
		style: 'mapbox://styles/mapbox/streets-v11',
		center: origin,
		zoom: 16
	});
 
	driver6_map.on('style.load', () => {
		driver6_map.setFog({}); // Set the default atmosphere style
	});
	
	const el = document.createElement('div');
	el.className = 'truck6_martker';
	driver6_marker = new mapboxgl.Marker(el)
		.setLngLat(origin)
		.addTo(driver6_map);

    driver6_map.on('load', function () {
  		sw = new mapboxgl.LngLat(origin[0], origin[1]);
		ne = new mapboxgl.LngLat(destination[0], destination[1]);
		llb = new mapboxgl.LngLatBounds(sw, ne);
		driver6_map.fitBounds(llb, {
		    padding: 100,
		    linear: true
		  });

		driver6_getRoute(origin, destination);
        
    });
}

async function driver6_getRoute(start, end) {
	const query = await fetch(
		`https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&overview=full&access_token=${mapboxgl.accessToken}`,
		{ method: 'GET' }
	);
	var data = await query.json();
	driver6_path = data.routes[0].geometry.coordinates;
	driver6_path = turf.linestring(driver6_path);
	
	driver6_drawRoute();
}

function driver6_drawRoute () {
	
	//pathLength = turf.lineDistance(path, 'miles')
	//steps=Math.floor(pathLength/drive_step)
	if(driver6_delivering || driver6_stopped || driver6_accident) {
		driver6_drive_step = driver6_drive_step;
	} else {
		driver6_drive_step = driver6_drive_step + Math.random()/10000;
	}
	nextPoint= turf.along(driver6_path, driver6_drive_step , 'miles')
	driver6_temp_coordinates.push( nextPoint.geometry.coordinates )
	
	stompClient.send("/app/track", {}, JSON.stringify({'driverID': 'driver6', coordinate: nextPoint.geometry.coordinates}));
	
	driver6_marker.setLngLat(nextPoint.geometry.coordinates);
	driver6_map.flyTo({
		center: nextPoint.geometry.coordinates,
		zoom: 17,
		essential: true // this animation is considered essential with respect to prefers-reduced-motion
	});
	
	geojson = {
		type: 'Feature',
		geometry: {
			type: "LineString",
			coordinates: driver6_temp_coordinates
		}
	}
	
	if (driver6_map.getSource('route')) {
	    driver6_map.getSource('route').setData(geojson);
	 }
	  // otherwise, we'll make a new request
	else {
	    driver6_map.addLayer({
		      id: 'route',
		      type: 'line',
		      source: {
		        type: 'geojson',
		        data: geojson
		      },
		      layout: {
		        'line-join': 'round',
		        'line-cap': 'round'
		      },
		      paint: {
		        'line-color': '#3887be',
		        'line-width': 5,
		        'line-opacity': 0.75
		  	  }
	  	  });
	}

	if(!driver6_accident && (driver6_temp_coordinates[driver6_temp_coordinates.length-1][1] !=2.214076 || driver6_temp_coordinates[driver6_temp_coordinates.length-1][0] != 48.846782)) {
		  requestAnimationFrame(driver6_drawRoute);
	}	 
}

function addEventListenerDriver6(){
	document.getElementById("driver6_delivered").addEventListener("click", function(event) {
		if(!driver6_delivering && !driver6_stopped && !driver6_accident) {
			driver6_delivering = true;
			const el = document.createElement('div');
			el.className = 'delivery_martker';
	  		// make a marker for each feature and add to the map
	  		var coordinate = driver6_temp_coordinates[driver6_temp_coordinates.length-1];
			var delivery_marker = new mapboxgl.Marker(el).setLngLat(coordinate).addTo(driver6_map);
			deliveringDriver6(true, coordinate, delivery_marker);
		}
	});
	
	document.getElementById('driver6_not_delivered').addEventListener("click", function(event) {	
		if(!driver6_delivering && !driver6_stopped && !driver6_accident) {
			driver6_delivering = true;
			const el = document.createElement('div');
			el.className = 'delivery_martker';
	  		// make a marker for each feature and add to the map
	  		var coordinate = driver6_temp_coordinates[driver6_temp_coordinates.length-1];
			var delivery_marker = new mapboxgl.Marker(el).setLngLat(driver6_temp_coordinates[driver6_temp_coordinates.length-1]).addTo(driver6_map);
			deliveringDriver6(false, coordinate, delivery_marker);
		}
	});
	
	document.getElementById('driver6_stopped').addEventListener("click", function(event) {
		if(!driver6_delivering && !driver6_stopped && !driver6_accident) {
			driver6_stopped = true;
			const el = document.createElement('div');
			el.className = 'stopped_martker';
	  		// make a marker for each feature and add to the map
			new mapboxgl.Marker(el).setLngLat(driver6_temp_coordinates[driver6_temp_coordinates.length-1]).addTo(driver6_map);
			stoppedDriver6();
		}
	});
	
	document.getElementById('driver6_accident').addEventListener("click", function(event) {
		if(!driver6_delivering && !driver6_stopped && !driver6_accident) {
			driver6_accident = true;
			const el = document.createElement('div');
			el.className = 'accident_martker';
	  		// make a marker for each feature and add to the map
			new mapboxgl.Marker(el).setLngLat(driver6_temp_coordinates[driver6_temp_coordinates.length-1]).addTo(driver6_map);
		}
	});
}

async function deliveringDriver6(success, coordinate, delivery_marker) {
	stompClient.send("/app/delivering", {}, JSON.stringify({'driverID': 'driver6', coordinate: nextPoint.geometry.coordinates, delivering: true}));
	var millisecondsToWait = Math.floor(Math.random() * 100001);
	setTimeout(function() {
		delivery_marker.remove();
		const el = document.createElement('div');
		if(success) {
			el.className = 'delivered_martker';
		} else {
			el.className = 'delivery_failure_martker';
		}
		
  		// make a marker for each feature and add to the map
		new mapboxgl.Marker(el).setLngLat(coordinate).addTo(driver6_map);
		stompClient.send("/app/delivery_status", {}, JSON.stringify({'driverID': 'driver6', coordinate: nextPoint.geometry.coordinates, delivered: success, timeSpent: millisecondsToWait}));
	    driver6_delivering = false;
	}, millisecondsToWait);
}

async function stoppedDriver6() {
	var millisecondsToWait = Math.floor(Math.random() * 100001);
	setTimeout(function() {
	    driver6_stopped = false;
	}, millisecondsToWait);
}