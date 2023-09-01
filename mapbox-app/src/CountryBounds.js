import React, { useEffect } from "react";
import * as turf from '@turf/turf';
import * as d3 from 'd3';

window.$numberAttacksCountry = []
window.$changeColor = 0
window.$isActivate = false

const CountryBounds = ({map, mapContainer, coordinates}) => {
    const countriesGeoJson = require("./countriesldgeo.json")
    const colorScale = d3.scaleSequential(["#FFFFCC", "red"]).domain([0, 100])
    
    useEffect (() => {
        if(!window.$isActivate){
            window.$isActivate = true

            if (map && coordinates && coordinates.length > 0) {

                if (window.$numberAttacksCountry.length === 0) {
                    window.$numberAttacksCountry = countriesGeoJson.map((feature) => [feature.properties.ADMIN, 0]);
                }


                let fillColor = 'white'

                for (const feature of countriesGeoJson) {
                    const countryName = feature.properties.ADMIN;
                    const countryPolygon = feature.geometry;

                    const countriesFeatures = {
                        type: 'Feature',
                        geometry: countryPolygon,
                        properties: {
                                fillColor: fillColor,
                            }
                    }

                    coordinates.forEach((coordinate) => {
                        if (turf.booleanPointInPolygon(coordinate.origin, countryPolygon)) {
                            const countryIndex = window.$numberAttacksCountry.findIndex((item) => item[0] === countryName);
                            if (countryIndex !== -1) {
                                const val = window.$numberAttacksCountry[countryIndex][1]++;
                                fillColor = colorScale(val);
                                console.log(`Country: ${countryName}, Value: ${val}, Fill Color: ${fillColor}`);
                            }
                        }
                    });

                    const countriesGeoJsonUpdated = {
                        type: 'FeatureCollection',
                        features: countriesFeatures
                    };
            
                    const countriesSourceId = `countries-source-${window.$changeColor}`
                    const countriesLayerId = `countries-layer-${window.$changeColor}`
                    window.$changeColor++
                
                    map.addSource(countriesSourceId, {
                        type: 'geojson',
                        data: countriesGeoJsonUpdated
                    });
                
                    map.addLayer({
                        id: countriesLayerId,
                        type: 'fill',
                        source: countriesSourceId,
                        paint: {
                        'fill-color': fillColor,
                        'fill-opacity': 0.6
                        }
                    });
                }
                

            }
        }
        
    },[])
    return  <div ref={mapContainer} style={{ position: 'absolute', top: 0, bottom: 0, width: '100%' }} />;
}

export default CountryBounds;