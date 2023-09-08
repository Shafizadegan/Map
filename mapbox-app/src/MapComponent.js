import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import './MapComponent.css';

import DrawArc from './DrawArc';
import CountryBounds from './CountryBounds';

mapboxgl.accessToken = 'pk.eyJ1IjoiZmxvd2VyMTIzNCIsImEiOiJjbGt4cmNzcTkwNDFrM2txcGlmbzBzcTE5In0.c-X97gswsZBF-x3lB3Gr7w';
let coordinates = []
let isData = false

const MapComponent = () => {
    const mapContainer = useRef(null);
    const [map, setMap] = useState(null);
    const [lng, setLng] = useState(51.338076);
    const [lat, setLat] = useState(35.699756);
    const [zoom, setZoom] = useState(1);

    const [clicked, setClicked] = useState(null)
    const iranBoundingBox = [
        [44.0149, 25.0594], // Southwest corner (min longitude, min latitude)
        [63.3196, 39.7715], // Northeast corner (max longitude, max latitude)
    ];

    // const [isData, setIsData] = useState(false)
    const [dataChunks, setDataChunks] = useState([]);
 

    useEffect((isData) => {
        console.log('Data',isData)

        const sse = new EventSource('http://localhost:8000/sse_stream/', {withCredentials: true})
        sse.onmessage = (event) => {
            const data = event.data
            const [origin_lng, origin_lat, destination_lng, destination_lat] = data.split(',');
            coordinates.push({ origin: [parseFloat(origin_lng), parseFloat(origin_lat)], destination: [parseFloat(destination_lng), parseFloat(destination_lat)]})
            const newDataChunk = { origin: [parseFloat(origin_lng), parseFloat(origin_lat)], destination: [parseFloat(destination_lng), parseFloat(destination_lat)]};
      
            // Update the state with the new data chunk
            setDataChunks((prevDataChunks) => [...prevDataChunks, newDataChunk]);
        }
        sse.onerror = () => {
            console.log(`error:${sse.onerror}`)
            sse.close();
        }
        return () => {
            sse.close();
        };

    },[isData])  

    useEffect(() => {
        // When new data chunks arrive, React will automatically render them
        console.log('Data Chunks:', dataChunks);
    }, [dataChunks]);

    useEffect(() => {
        if (!map) {
            const mapInstance = new mapboxgl.Map({
                container: mapContainer.current,
                style: 'mapbox://styles/mapbox/light-v10',
                center: [lng, lat],
                zoom: zoom,
                maxZoom: 5, 
                maxBounds: [
                    [-180.0, -90.0],  // Southwest corner (min longitude, min latitude)
                    [180.0, 90.0]   // Northeast corner (max longitude, max latitude)
                ]
            });

            mapInstance.on('load', () => {
                setMap(mapInstance);

                mapInstance.on('click', (e) => {
                    const clickedLngLat = e.lngLat;
                    setClicked([clickedLngLat.lng, clickedLngLat.lat]);
                
                    const withinBounds =
                        clickedLngLat.lng >= iranBoundingBox[0][0] &&
                        clickedLngLat.lng <= iranBoundingBox[1][0] &&
                        clickedLngLat.lat >= iranBoundingBox[0][1] &&
                        clickedLngLat.lat <= iranBoundingBox[1][1];
                
                    if (withinBounds) {
                        mapInstance.fitBounds(iranBoundingBox, {
                            padding: 40, // Adjust padding as needed
                        });
                    }
                });
                
            });
            
            mapInstance.on('move', () => {
                setLng(mapInstance.getCenter().lng.toFixed(4));
                setLat(mapInstance.getCenter().lat.toFixed(4));
                setZoom(mapInstance.getZoom().toFixed(2));
            });
        }
    }, [map, lat, lng, zoom]);

    if(coordinates.length > 0) isData = true
    console.log('coordinate:', coordinates)
    console.log('isData', isData, coordinates.length)

    return (
        <div className='map'>
            <div className="sidebar">
                Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}

                {clicked && (
                    <div>
                        Clicked Coordinates: {clicked[0].toFixed(4)}, {clicked[1].toFixed(4)}
                    </div>
                )}
            </div>
            <DrawArc map={map} mapContainer={mapContainer}  arrayInput={coordinates} refresh={isData}/>
            <div ref={mapContainer} className="map-container" />
            {/* <CountryBounds map={map} mapContainer={mapContainer} coordinates={coordinates}/> */}
        </div>
    );
    
};

export default MapComponent;









    // const [coordinates, setCoordinates] = useState([])
    // useEffect(() => {
    //     const generate_coordinate = []
    //     for (let i = 0; i < 200; i++) {
    //         const lngO = Math.random() * (180 - (-180)) + (-180).toFixed(4) * 1;
    //         const latO = Math.random() * (90 - (-90)) + (-90).toFixed(4) * 1;
    //         const lngD = Math.random() * (180 - (-180)) + (-180).toFixed(4) * 1;
    //         const latD = Math.random() * (90 - (-90)) + (-90).toFixed(4) * 1;
    //         generate_coordinate.push({origin: [lngO, latO], destination: [lngD, latD]})
    //         console.log(`coordinates: ${generate_coordinate}`)
    //     }

    //     setCoordinates(generate_coordinate)

    // }, []);

    // const coordinates = [
    //     { origin: [-122.414, 37.776], destination: [51.338076, 35.699756] }, 
    //     { origin: [-122.414, 37.776], destination: [-77.032, 38.913] },
    //     { origin: [48.704824, 34.801698], destination: [52.703847, 32.977869] },
    //     { origin: [52.703847, 32.977869], destination: [48.704824, 34.801698] },
    //     { origin:  [46.682359, 37.674864], destination: [57.185288, 37.116263] },
    //     { origin:  [61.008531, 26.381732], destination: [46.682359, 37.674864] },
    //     { origin:  [49.231187, 30.781569], destination: [57.185288, 37.116263] },
    //     { origin:  [57.18528, 37.116263], destination: [49.231187, 30.781569] },
    //     { origin:  [100.00, 40.00], destination: [102.00, 42.00] },
    //     { origin:  [-100.00, -40.00], destination: [100.00, 40.00] },
    //     { origin:  [100.00, 40.00], destination: [-100.00, -40.00] },
    //     { origin:  [-91.00, -70.00], destination: [91.00, 70.00] },
    //     { origin:  [91.00, 70.00], destination: [-91.00, -70.00] },
    //     { origin:  [-90.00, -70.00], destination: [90.00, 70.00] },
    //     { origin:  [90.00, 70.00], destination: [-90.00, -70.00] },
    //     { origin:  [-180.00, -70.00], destination: [180.00, 70.00] },
    //     { origin:  [180.00, 90.00], destination: [-180.00, -90.00] },
    //     { origin:  [-154.2188, 63.9069], destination: [-180.00, -90.00] },
    //     { origin:  [ -97.9464, 41.7823], destination: [-180.00, -90.00] },
    //     { origin:  [ -97.9464, 41.7823], destination: [46.682359, 37.674864] },
    //     { origin:  [ -97.9464, 41.7823], destination: [52.703847, 32.977869] },
    //     { origin:  [ -97.9464, 41.7823], destination: [57.185288, 37.116263] },
    //     { origin:  [ -97.9464, 41.7823], destination: [-77.032, 38.913] },
    //     { origin:  [ -97.9464, 41.7823], destination: [51.338076, 35.699756] },
    //     { origin:  [ -97.9464, 41.7823], destination: [102.00, 42.00] },
    //     { origin:  [-154.2188, 63.9069], destination: [46.682359, 37.674864] },
    //     { origin:  [-154.2188, 63.9069], destination: [52.703847, 32.977869] },
    //     { origin:  [-154.2188, 63.9069], destination: [-77.032, 38.913] },
    //     { origin:  [-154.2188, 63.9069], destination: [51.338076, 35.699756] },
    //     { origin:  [-154.2188, 63.9069], destination: [46.682359, 37.674864] },
    //     { origin:  [-110.7015, 42.2839], destination: [-180.00, -90.00] },
    //     { origin:  [-110.7015, 42.2839], destination: [46.682359, 37.674864] },
    //     { origin:  [-110.7015, 42.2839], destination: [51.338076, 35.699756] },
    //     { origin:  [-110.7015, 42.2839], destination: [52.703847, 32.977869] },
    // ];
    

// import React, { useRef, useEffect, useState } from 'react';
// import mapboxgl from 'mapbox-gl';
// import './MapComponent.css'
// import DrawArc from './DrawArc';

// mapboxgl.accessToken = 'pk.eyJ1IjoiZmxvd2VyMTIzNCIsImEiOiJjbGt4cmNzcTkwNDFrM2txcGlmbzBzcTE5In0.c-X97gswsZBF-x3lB3Gr7w';

// const MapComponent = () => {
//     const mapContainer = useRef(null);
//     const [map, setMap] = useState(null);
//     const [lng, setLng] = useState(51.338076);
//     const [lat, setLat] = useState(35.699756);
//     const [zoom, setZoom] = useState(2);

//     const coordinates = [
//         { origin: [-122.414, 37.776], destination: [51.338076, 35.699756] }, 
//         { origin: [-122.414, 37.776], destination: [-77.032, 38.913] },
//         { origin: [48.704824, 34.801698], destination: [52.703847, 32.977869] },
//         { origin: [52.703847, 32.977869], destination: [48.704824, 34.801698] }
//       ];

//     useEffect(() => {
//         if (!map) {
//             const mapInstance = new mapboxgl.Map({
//                 container: mapContainer.current,
//                 style: 'mapbox://styles/mapbox/streets-v12',
//                 center: [lng, lat],
//                 zoom: zoom,
//         });

//         mapInstance.on('load', () => {
//             setMap(mapInstance);
//         });
        
//         mapInstance.on('move', () => {
//             setLng(mapInstance.getCenter().lng.toFixed(4));
//             setLat(mapInstance.getCenter().lat.toFixed(4));
//             setZoom(mapInstance.getZoom().toFixed(2));
//         });
//         }
//     }, [map, lat, lng, zoom]);

//     return (
//         <div className='map'>
//             <div className="sidebar">
//                 Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
//             </div>
//             <div ref={mapContainer} className="map-container" />
//             <DrawArc map={map} mapContainer={mapContainer}  arrayInput={coordinates}/>
//             {/* <DrawArc map={map} mapContainer={mapContainer}/> */}
//         </div>
//     );
//   };
//   export default MapComponent;