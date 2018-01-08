function addMarker (point, label, BMap, map) {
    let marker = new BMap.Marker(point)
    map.addOverlay(marker)
    marker.setLabel(label)
}
const mapCommonFn = {
    centerAndZoomPointFn (add, city, myGeo, map, BMap) {
        myGeo.getPoint(add, function (point) {
            map.centerAndZoom(new BMap.Point(point.lng, point.lat), 13) // 定位城市中心区域
        }, city)
    },
    geocodeSearch (add, city, myGeo, map, BMap) {
        myGeo.getPoint(add, function (point) {
            if (point) {
                let address = new BMap.Point(point.lng, point.lat)
                addMarker(address, new BMap.Label(add, {offset: new BMap.Size(20, -10)}), BMap, map)
            }
        }, city)
    }
}

export default mapCommonFn
