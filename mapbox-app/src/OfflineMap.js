import React, {useEffect} from "react";
import mapboxgl from "mapbox-gl";
import MapComponent from "./MapComponent";

const OfflineMap = () => {
    useEffect (() => {
            const createOfflinePack = async () => {
                const progressListener = (offlineRegion, status) => console.log(offlineRegion, status);
                const errorListener = (offlineRegion, err) => console.log(offlineRegion, err);

                try {
                    await mapboxgl.offlineManager.createPack({
                        name: 'offlinePack',
                        styleURL: 'mapbox://styles/mapbox/streets-v12',
                        minZoom: 2,
                        maxZoom: 20,
                        bounds: [[-74.0059, 40.7128], [-74.2591, 40.4774]]
                    }, progressListener, errorListener);
                } catch (error) {
                    console.error('Error creating offline pack:', error);
                }
            }
        }
    )

    return (
        <div className="OfflineMap">
            <MapComponent />
        </div>
    );

};
export default OfflineMap;