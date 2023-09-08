import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Button } from "@react-md/button";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogFooter,
} from "@react-md/dialog";
import { useToggle } from "@react-md/utils";
import * as turf from '@turf/turf';
import caretImage from './caret-forward-outline_1.png';
import * as d3 from 'd3';

window.$number = 0

const DrawArc = ({map, mapContainer, arrayInput, refresh}) => {

  const [animationStarted, setAnimationStarted] = useState(false)
  
  const [selectedArcId, setSelectedArcId] = useState(null)
  const [originValue, setOriginValue] = useState('');
  const [destinationValue, setDestinationValue] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false)


  const openDialog = (origin, destination) => {
    console.log(`isDialogOpen:${isDialogOpen}`)
    setOriginValue(origin)
    setDestinationValue(destination)
    setIsDialogOpen(true)
    console.log(`isDialogOpen:${isDialogOpen}`)

  }

  const closeDialog = () => {
    setIsDialogOpen(false)
  }
  
  const countriesGeoJson = require("./countriesldgeo.json")
  const colorScale = d3.scaleSequential(["#FFFFCC", "red"]).domain([0, 100])

  useEffect(() => {
    //تعین کشور مبدا حمله
    if (window.$numberAttacksCountry.length === 0) {
      window.$numberAttacksCountry = countriesGeoJson.map((feature) => [feature.properties.ADMIN, 0]);
    }

    if (map && arrayInput && arrayInput.length > 0 && !animationStarted) {
      console.log('arrayInput', arrayInput)

      arrayInput.forEach((arcInput) => {
        //تغییر رنگ کشرها براساس تعداد حملات
        for (const feature of countriesGeoJson) {
          const countryName = feature.properties.ADMIN;
          const countryPolygon = feature.geometry;

          if (turf.booleanPointInPolygon(arcInput.origin, countryPolygon)) {
            const countryIndex = window.$numberAttacksCountry.findIndex((item) => item[0] === countryName);

            if (countryIndex !== -1) {
              const val = window.$numberAttacksCountry[countryIndex][1]++;
              const fillColor = colorScale(val);

              // Find the existing layer and update its paint property
              const countriesLayerId = `countries-layer-${countryName}`;
              const existingLayer = map.getLayer(countriesLayerId);
              if (existingLayer) {
                map.setPaintProperty(countriesLayerId, 'fill-color', fillColor);
              } else {
                // If the layer doesn't exist, add it to the map
                map.addLayer({
                  id: countriesLayerId,
                  type: 'fill',
                  source: {
                    type: 'geojson',
                    data: {
                      type: 'Feature',
                      geometry: countryPolygon
                    }
                  },
                  paint: {
                    'fill-color': fillColor,
                    'fill-opacity': 0.6
                  }
                });
              }

              console.log(`Origin:${arcInput.origin} Country: ${countryName}, Value: ${val}, Fill Color: ${fillColor}`);
            }
          }
        }

        //ایجاد کمان
        const route = {
          'type': 'FeatureCollection',
          'features': [
            {
              'type': 'Feature',
              'geometry': {
                'type': 'LineString',
                'coordinates': [arcInput.origin, arcInput.destination]
              }
            }
          ]
        };
  
        const randomColor = `#${Math.floor(Math.random()*16777215).toString(16)}`;
        const sourceId = `route-source-${window.$number}`
        const lineLayerId = `line-layer-${window.$number}`
        const pointSourceId = `point-source-${window.$number}`
        const pointLayerId = `point-layer-${window.$number}`
        window.$number++

        //ایجاد لایه های کمان
        const arc = [];
        const steps = 50;

        for (let i = 1; i <= steps; i++) {
          const t = i / steps;
          const lng = arcInput.origin[0] + t * (arcInput.destination[0] - arcInput.origin[0]);
          const lat = arcInput.origin[1] + t * (arcInput.destination[1] - arcInput.origin[1]);

          if (Math.abs(arcInput.destination[0] - arcInput.origin[0]) > 180) {
            if (arcInput.destination[0] < arcInput.origin[0]) {
              if (lng > 180) {
                arc.push([lng - 360, lat]);
              } else {
                arc.push([lng, lat]);
              }
            } else {
              if (lng < -180) {
                arc.push([lng + 360, lat]);
              } else {
                arc.push([lng, lat]);
              }
            }
          } else {
            arc.push([lng, lat]);
          }
        }
    
        map.addSource(sourceId, {
          type: 'geojson',
          data: route
        });
    
        map.addLayer({
          id: lineLayerId,
          type: 'line',
          source: sourceId,
          paint: {
            'line-width': 2,
            'line-color': randomColor
          }
        });

        map.loadImage(caretImage, (error, image) => {
          if (error) throw error;
          map.addImage(pointLayerId, image);
        })

        const point = {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'Point',
                coordinates: arcInput.origin
              }
            }
          ]
        };
    
        map.addSource(pointSourceId, {
          type: 'geojson',
          data: point
        });

        map.addLayer({
          id: pointLayerId,
          source: pointSourceId,
          type: 'circle',
          paint: {
            'circle-radius': 5,
            'circle-color': randomColor
          }
        });

        // const arcBearing = turf.bearing(
        //   turf.point(arcInput.origin),
        //   turf.point(arcInput.destination)
        // );        

        // map.addLayer({
        //   id: `${pointLayerId}-${arcInput.id}`,
        //   source: pointSourceId,
        //   type: 'symbol',
        //   layout: {
        //     'icon-image': pointLayerId,
        //     'icon-size': 0.02,
        //     'icon-rotate': arcBearing,
        //     'icon-rotation-alignment': 'map',
        //     'icon-allow-overlap': true,
        //     'icon-ignore-placement': true,
        //     },
        //     paint: {
        //       'text-color': randomColor, 
        //     },
        // });

        let counter = 0;
    
        function animate() {
          if (counter < arc.length) {

            map.on('mouseenter', 'line-layer', (e) => {
              const { id } = e.features[0];
              setSelectedArcId(id);
            });

            map.on('mouseleave', 'line-layer', () => {
              setSelectedArcId(null);
            })

            const [lng, lat] = arc[counter];
            // point.features[0].properties = {'icon-rotate': turf.bearing(
            //   turf.point(arc[counter]),
            //   turf.point(arc[counter + 1])
            // )}
            point.features[0].geometry.coordinates = [lng, lat];
            route.features[0].geometry.coordinates = arc.slice(0, counter + 1);
            
            map.getSource(pointSourceId).setData(point);
            map.getSource(sourceId).setData(route);
            
            counter++;
            requestAnimationFrame(animate);
          }
        }

        animate();
        setAnimationStarted(true);

        map.on("mouseenter", lineLayerId, (e) => {
          console.log('Mouse', e)
          setSelectedArcId(lineLayerId);
        });

        map.on("mouseleave", lineLayerId, () => {
          setSelectedArcId(null);
        });

        map.on("click", lineLayerId, (e) => {
          console.log('Origin', route.features[0].geometry.coordinates[0])
          console.log('destination', route.features[0].geometry.coordinates[49])
          console.log('click', e)
          openDialog(route.features[0].geometry.coordinates[0], route.features[0].geometry.coordinates[49])
        })
      });
    }
  }, [map, arrayInput]);

  //امکان مشاهده تنها یک کمان
  useEffect(() => {
    if (map) {
      if(selectedArcId == null){
        for (const lineLayerId of arrayInput.map((_, index) => `line-layer-${index}`)) {
          const visibility = "visible"
          map.setLayoutProperty(lineLayerId, "visibility", visibility);
        }
      }
      else {
        for (const lineLayerId of arrayInput.map((_, index) => `line-layer-${index}`)) {
          const visibility = lineLayerId == selectedArcId ? "visible" : "none";
          map.setLayoutProperty(lineLayerId, "visibility", visibility);
          console.log('selectedArcId:',selectedArcId, 'lineLayerId:', lineLayerId, visibility)
        }
      }
    }
  }, [selectedArcId]);

  useEffect(() => {
    if(animationStarted && map) {
      for (const value of arrayInput.map((_, index) => index)) {

        const sourceId = `route-source-${value}`
        const lineLayerId = `line-layer-${value}`
        const pointSourceId = `point-source-${value}`
        const pointLayerId = `point-layer-${value}`

        console.log("remove")
        map.removeLayer(lineLayerId);
        // map.removeSource(sourceId);
        map.removeLayer(pointLayerId);
        // map.removeSource(pointSourceId)
      }
    }
  })

  return (
  <div className='dialog'>
    {/* <div ref={mapContainer} style={{ position: 'absolute', top: 0, bottom: 0, width: '100%' }} /> */}
    {isDialogOpen && (
      <Dialog
      id="main-dialog"
      visible={isDialogOpen}
      onRequestClose={closeDialog}
      aria-labelledby="main-dialog-title"
      >
        <DialogHeader>
          <DialogTitle id="main-dialog-title">Information</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <p>Origin: {originValue}</p>
          <p>Destination: {destinationValue}</p>
        </DialogContent>
        <DialogFooter>
          <Button id="main-dialog-close" onClick={closeDialog}>
            Close
          </Button>
        </DialogFooter>
      </Dialog>
    )}
  </div>);
};

export default DrawArc;
























































// Draw one Arc
// import React, { useEffect } from 'react';
// import mapboxgl from 'mapbox-gl';
// import * as turf from '@turf/turf';
// import DeckGL from '@deck.gl/react'
// import { LineLayer, ScatterplotLayer } from '@deck.gl/layers';

// const DrawArc = ({ map, mapContainer }) => {
//   useEffect(() => {
//     if (map) {
//       const origin = [-122.414, 37.776]; // San Francisco
//       const destination = [51.338076, 35.699756]; // Iran

//       const route = {
//         'type': 'FeatureCollection',
//         'features': [
//           {
//             'type': 'Feature',
//             'geometry': {
//               'type': 'LineString',
//               'coordinates': [origin, destination]
//             }
//           }
//         ]
//       };

//       const steps = 500;
//       const arc = [];

//       for (let i = 0; i < steps; i++) {
//         const segment = turf.along(route.features[0], (i / steps) * turf.length(route.features[0]));
//         arc.push(segment.geometry.coordinates);
//       }

//       map.addSource('route', {
//         type: 'geojson',
//         data: route
//       });

//       map.addLayer({
//         id: 'route',
//         type: 'line',
//         source: 'route',
//         paint: {
//           'line-width': 2,
//           'line-color': '#007cbf'
//         }
//       });

//       const point = {
//         type: 'FeatureCollection',
//         features: [
//           {
//             type: 'Feature',
//             properties: {},
//             geometry: {
//               type: 'Point',
//               coordinates: origin
//             }
//           }
//         ]
//       };

//       map.addSource('point', {
//         type: 'geojson',
//         data: point
//       });

//       map.addLayer({
//         id: 'point',
//         source: 'point',
//         type: 'circle',
//         paint: {
//           'circle-radius': 10,
//           'circle-color': '#007cbf'
//         }
//       });

//       let counter = 0;

//       function animate() {
//         if (counter < arc.length) {
//           const [lng, lat] = arc[counter];
//           point.features[0].geometry.coordinates = [lng, lat];
//           route.features[0].geometry.coordinates = arc.slice(0, counter + 1);
          
//           map.getSource('point').setData(point);
//           map.getSource('route').setData(route);
          
//           counter++;
//           requestAnimationFrame(animate);
//         }
//       }

//       animate();
//     }
//   }, [map]);

//   return <div ref={mapContainer} style={{ position: 'absolute', top: 0, bottom: 0, width: '100%' }} />;
// };

// export default DrawArc;