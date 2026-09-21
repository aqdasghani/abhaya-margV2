import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

function RecenterMap({ lat, lng }) {
  const map = useMap()

  useEffect(() => {
    map.setView([lat, lng], map.getZoom())
  }, [lat, lng, map])

  return null
}

export default RecenterMap