import { useEffect, useRef, useState } from 'react'
import { subscribeToIncidents } from '../firebase/adminService'

// Web Audio API synthesizer for instant zero-dependency alert sound
function playEmergencyChime(isSos = true) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = isSos ? 'sawtooth' : 'sine'
    // Two-tone urgent pulse
    osc.frequency.setValueAtTime(isSos ? 880 : 587.33, now)
    osc.frequency.setValueAtTime(isSos ? 1174.66 : 783.99, now + 0.15)
    osc.frequency.setValueAtTime(isSos ? 880 : 587.33, now + 0.3)

    gain.gain.setValueAtTime(0.25, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.55)
  } catch {
    // Ignore audio autoplay restrictions if user hasn't interacted with document yet
  }
}

export function useAdminEmergencyAlerts() {
  const [activeAlerts, setActiveAlerts] = useState([])
  const [soundEnabled, setSoundEnabled] = useState(true)
  const isFirstLoadRef = useRef(true)
  const knownIdsRef = useRef(new Set())

  useEffect(() => {
    const unsubscribe = subscribeToIncidents((incidents) => {
      if (isFirstLoadRef.current) {
        // Seed initial known IDs so we don't alert on existing incidents
        incidents.forEach((inc) => knownIdsRef.current.add(inc.incidentId || inc.id))
        isFirstLoadRef.current = false
        return
      }

      // Check for newly arrived active emergencies
      const newEmergencies = []
      incidents.forEach((inc) => {
        const id = inc.incidentId || inc.id
        if (!knownIdsRef.current.has(id)) {
          knownIdsRef.current.add(id)
          if (inc.status === 'ACTIVE' && (inc.incidentType === 'SOS' || inc.incidentType === 'GEOFENCE' || inc.incidentType === 'LOST')) {
            newEmergencies.push(inc)
          }
        }
      })

      if (newEmergencies.length > 0) {
        if (soundEnabled) {
          const hasSos = newEmergencies.some((e) => e.incidentType === 'SOS')
          playEmergencyChime(hasSos)
        }
        setActiveAlerts((prev) => [...newEmergencies, ...prev])
      }
    })

    return () => unsubscribe()
  }, [soundEnabled])

  function dismissAlert(incidentId) {
    setActiveAlerts((prev) => prev.filter((a) => (a.incidentId || a.id) !== incidentId))
  }

  function dismissAll() {
    setActiveAlerts([])
  }

  return {
    activeAlerts,
    dismissAlert,
    dismissAll,
    soundEnabled,
    setSoundEnabled,
  }
}
