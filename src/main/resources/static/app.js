var stompClient = null;
// Driver 1 
var driver1_map = null;
var driver1_marker = null;
var driver1_path = null;
var driver1_temp_coordinates = [];
var driver1_drive_step = 0.0004
var driver1_delivering = false;

// Driver 2 
var driver2_map = null;
var driver2_marker = null;
var driver2_path = null;
var driver2_temp_coordinates = [];
var driver2_drive_step = 0.0004;

// Driver 3 
var driver3_map = null;
var driver3_marker = null;
var driver3_path = null;
var driver3_temp_coordinates = [];
var driver3_drive_step = 0.0004;

// Driver 4 
var driver4_map = null;
var driver4_marker = null;
var driver4_path = null;
var driver4_temp_coordinates = [];
var driver4_drive_step = 0.0004;

// Driver 5 
var driver5_map = null;
var driver5_marker = null;
var driver5_path = null;
var driver5_temp_coordinates = [];
var driver5_drive_step = 0.0004;

// Driver 6 
var driver6_map = null;
var driver6_marker = null;
var driver6_path = null;
var driver6_temp_coordinates = [];
var driver6_drive_step = 0.0004;

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

/*function connect() {
    var socket = new SockJS('/gs-guide-websocket');
    stompClient = Stomp.over(socket);
    stompClient.connect({}, function (frame) {
        //setConnected(true);
        //sendName();
        console.log('Connected: ' + frame);
        var polyline = L.polyline([], {color: 'red'}).addTo(map);
        
        stompClient.subscribe('/topic/info', function (greeting) {
			var cartrackinfo = JSON.parse(greeting.body);
			var lat = cartrackinfo.latitude;
			var lon = cartrackinfo.longitude;
	   		if(firsttime) {
				myMovingMarker = L.Marker.movingMarker([[lat, lon],[lat, lon]],
                        [1000], {autostart: true, loop: false}).addTo(map);
                firsttime = false;
			} else {
				myMovingMarker.addLatLng([lat, lon],1000);
			}
			
			point = {lat: lat, lng: lon};
			polyline.addLatLng(point);
            console.log(JSON.parse(greeting.body).content);
        });
    });
}

function sendName() {
    stompClient.send("/app/track", {}, "Hello, STOMP");
}

function showGreeting(message) {
    $("#greetings").append("<tr><td>" + message + "</td></tr>");
}*/

document.addEventListener('DOMContentLoaded', function(event){
	mapboxgl.accessToken = 'pk.eyJ1IjoiYWxmcmVkb3dvbmEiLCJhIjoiY2w3c3M1NHVoMHM2MDNxcDJ5Z3JrYzRpaCJ9.iJBu83MKVgJzQEFvVdk9zw';
	
	renderMapDriver1();
	renderMapDriver2();
	renderMapDriver3();
	renderMapDriver4();
	renderMapDriver5();
	renderMapDriver6();
	
	addEventListenerDriver1();
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
	el.className = 'truck_martker';
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
	if(driver1_delivering) {
		driver1_drive_step = driver1_drive_step;
	} else {
		driver1_drive_step = driver1_drive_step + Math.random()/10000;
	}
	
	nextPoint= turf.along(driver1_path, driver1_drive_step , 'miles')
	driver1_temp_coordinates.push( nextPoint.geometry.coordinates )
	
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

	if(driver1_temp_coordinates[driver1_temp_coordinates.length-1][1] !=2.295642 || driver1_temp_coordinates[driver1_temp_coordinates.length-1][0] != 48.874198) {
		  requestAnimationFrame(driver1_drawRoute);
	}	 
}

function addEventListenerDriver1(){
	document.getElementById("driver1_delivered").addEventListener("click", function(event) {
		driver1_delivering = true;
		//<a href="https://www.flaticon.com/free-icons/truck" title="truck icons">Truck icons created by Freepik - Flaticon</a>
		const el = document.createElement('div');
		el.className = 'delivery_martker';
  		// make a marker for each feature and add to the map
		new mapboxgl.Marker(el).setLngLat(driver1_temp_coordinates[driver1_temp_coordinates.length-1]).addTo(driver1_map);
		deliveringDriver1();
	});
	
	/*document.getElementById('driver1_not_delivered').click(function(event) {
		
	});
	
	document.getElementById('').click(function(event) {
		
	});
	
	document.getElementById('').click(function(event) {
		
	});*/
}

async function deliveringDriver1() {
	var millisecondsToWait = Math.floor(Math.random() * 100001);
	setTimeout(function() {
	    driver1_delivering = false;
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
	
	driver2_marker = new mapboxgl.Marker()
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
	driver2_drive_step = driver2_drive_step + Math.random()/10000
	nextPoint= turf.along(driver2_path, driver2_drive_step , 'miles')
	driver2_temp_coordinates.push( nextPoint.geometry.coordinates )
	
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

	if(driver2_temp_coordinates[driver2_temp_coordinates.length-1][1] !=2.365265 || driver2_temp_coordinates[driver2_temp_coordinates.length-1][0] != 48.864840) {
		  requestAnimationFrame(driver2_drawRoute);
	}	 
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
	
	driver3_marker = new mapboxgl.Marker()
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
	driver3_drive_step = driver3_drive_step + Math.random()/10000
	nextPoint= turf.along(driver3_path, driver3_drive_step , 'miles')
	driver3_temp_coordinates.push( nextPoint.geometry.coordinates )
	
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

	if(driver3_temp_coordinates[driver3_temp_coordinates.length-1][1] !=2.344833 || driver3_temp_coordinates[driver3_temp_coordinates.length-1][0] != 48.890827) {
		  requestAnimationFrame(driver3_drawRoute);
	}	 
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
	
	driver4_marker = new mapboxgl.Marker()
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
	driver4_drive_step = driver4_drive_step + Math.random()/10000
	nextPoint= turf.along(driver4_path, driver4_drive_step , 'miles')
	driver4_temp_coordinates.push( nextPoint.geometry.coordinates )
	
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

	if(driver4_temp_coordinates[driver4_temp_coordinates.length-1][1] !=2.302839 || driver4_temp_coordinates[driver4_temp_coordinates.length-1][0] != 48.838729) {
		  requestAnimationFrame(driver4_drawRoute);
	}	 
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
	
	driver5_marker = new mapboxgl.Marker()
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
	driver5_drive_step = driver5_drive_step + Math.random()/10000
	nextPoint= turf.along(driver5_path, driver5_drive_step , 'miles')
	driver5_temp_coordinates.push( nextPoint.geometry.coordinates )
	
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

	if(driver5_temp_coordinates[driver5_temp_coordinates.length-1][1] !=2.222794 || driver5_temp_coordinates[driver5_temp_coordinates.length-1][0] != 48.870243) {
		  requestAnimationFrame(driver5_drawRoute);
	}	 
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
	
	driver6_marker = new mapboxgl.Marker()
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
	driver6_drive_step = driver6_drive_step + Math.random()/10000
	nextPoint= turf.along(driver6_path, driver6_drive_step , 'miles')
	driver6_temp_coordinates.push( nextPoint.geometry.coordinates )
	
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

	if(driver6_temp_coordinates[driver6_temp_coordinates.length-1][1] !=2.214076 || driver6_temp_coordinates[driver6_temp_coordinates.length-1][0] != 48.846782) {
		  requestAnimationFrame(driver6_drawRoute);
	}	 
}