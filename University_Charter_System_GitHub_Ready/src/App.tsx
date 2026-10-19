/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, BaggageClaim, Utensils, Info, CheckCircle2 } from 'lucide-react';

/* --- DATA MODELS --- */
/* Defines the structure for transit routes and booking records */
interface Route {
  id: string;
  destination: string;
  departure: string;
  date: string;
  fare: number;
  capacity: number;
  totalSeats: number;
  trainName: string;
  trainNumber: string;
  charterId: string;
  stops: { name: string; time: string }[];
  distance: string;
  travelTime: string;
}

interface Booking {
  pnr: string;
  routeId: string;
  bookingDate: string;
  journeyDate: string;
  status: 'BOOKED' | 'CANCELLED' | 'COMPLETED';
  coachLabel: string;
}

/* --- SYSTEM CONSTANTS --- */
/* Static data for available routes, initial occupancy, and coach multipliers */
const ROUTES: Route[] = [
  {
    id: 'UC_001',
    destination: 'NEW DELHI',
    departure: '06:30 AM',
    date: 'FRI, 15 MAY 2026',
    fare: 2450,
    capacity: 85,
    totalSeats: 200,
    trainName: 'TAMIL NADU EXPRESS',
    trainNumber: '12621',
    charterId: 'CH_12621',
    stops: [
      { name: 'CHENNAI CAMPUS', time: '06:30 AM' },
      { name: 'NAGPUR JUNCTION', time: '08:45 PM' },
      { name: 'BHOPAL TECHNICAL', time: '02:15 AM' },
      { name: 'JHANSI TERMINAL', time: '06:30 AM' },
      { name: 'NEW DELHI TERMINAL', time: '02:30 PM' },
    ],
    distance: '2,180 KM',
    travelTime: '32H 00M',
  },
  {
    id: 'UC_002',
    destination: 'MUMBAI',
    departure: '08:15 AM',
    date: 'MON, 18 MAY 2026',
    fare: 1850,
    capacity: 42,
    totalSeats: 200,
    trainName: 'MUMBAI MAIL',
    trainNumber: '11008',
    charterId: 'CH_11008',
    stops: [
      { name: 'CHENNAI CAMPUS', time: '08:15 AM' },
      { name: 'RENIGUNTA JN', time: '11:30 AM' },
      { name: 'WADI JUNCTION', time: '07:45 PM' },
      { name: 'SOLAPUR STATION', time: '11:15 PM' },
      { name: 'MUMBAI TERMINAL', time: '06:45 AM' },
    ],
    distance: '1,280 KM',
    travelTime: '22H 30M',
  },
  {
    id: 'UC_003',
    destination: 'KOLKATA',
    departure: '09:00 AM',
    date: 'FRI, 22 MAY 2026',
    fare: 2150,
    capacity: 92,
    totalSeats: 200,
    trainName: 'COROMANDEL EXPRESS',
    trainNumber: '12842',
    charterId: 'CH_12842',
    stops: [
      { name: 'CHENNAI CAMPUS', time: '09:00 AM' },
      { name: 'VIJAYAWADA JN', time: '04:30 PM' },
      { name: 'VISAKHAPATNAM', time: '11:45 PM' },
      { name: 'BHUBANESWAR', time: '06:15 AM' },
      { name: 'KOLKATA TERMINAL', time: '01:30 PM' },
    ],
    distance: '1,660 KM',
    travelTime: '28H 30M',
  },
  {
    id: 'UC_004',
    destination: 'BENGALURU',
    departure: '07:45 AM',
    date: 'MON, 18 MAY 2026',
    fare: 850,
    capacity: 65,
    totalSeats: 200,
    trainName: 'LALBAGH EXPRESS',
    trainNumber: '12785',
    charterId: 'CH_12785',
    stops: [
      { name: 'CHENNAI CAMPUS', time: '07:45 AM' },
      { name: 'KATPADI JN', time: '10:15 AM' },
      { name: 'JOLARPETTAI', time: '11:45 AM' },
      { name: 'BENGALURU TERMINAL', time: '02:15 PM' },
    ],
    distance: '360 KM',
    travelTime: '06H 30M',
  },
  {
    id: 'UC_005',
    destination: 'HYDERABAD',
    departure: '10:30 AM',
    date: 'WED, 20 MAY 2026',
    fare: 1250,
    capacity: 40,
    totalSeats: 200,
    trainName: 'CHARMINAR EXPRESS',
    trainNumber: '12130',
    charterId: 'CH_12130',
    stops: [
      { name: 'CHENNAI CAMPUS', time: '10:30 AM' },
      { name: 'NELLORE STATION', time: '01:45 PM' },
      { name: 'VIJAYAWADA JN', time: '05:30 PM' },
      { name: 'HYDERABAD TERMINAL', time: '11:15 PM' },
    ],
    distance: '630 KM',
    travelTime: '12H 45M',
  },
  {
    id: 'UC_006',
    destination: 'KOCHI',
    departure: '05:15 AM',
    date: 'FRI, 22 MAY 2026',
    fare: 1400,
    capacity: 92,
    totalSeats: 200,
    trainName: 'ALLEPPEY EXPRESS',
    trainNumber: '16315',
    charterId: 'CH_16315',
    stops: [
      { name: 'CHENNAI CAMPUS', time: '05:15 AM' },
      { name: 'SALEM JUNCTION', time: '10:45 AM' },
      { name: 'COIMBATORE NORTH', time: '01:30 PM' },
      { name: 'KOCHI TERMINAL', time: '06:45 PM' },
    ],
    distance: '680 KM',
    travelTime: '13H 30M',
  },
  {
    id: 'UC_007',
    destination: 'PUNE',
    departure: '11:00 PM',
    date: 'MON, 25 MAY 2026',
    fare: 1900,
    capacity: 15,
    totalSeats: 200,
    trainName: 'CHENNAI PUNE EXPRESS',
    trainNumber: '12864',
    charterId: 'CH_12864',
    stops: [
      { name: 'CHENNAI CAMPUS', time: '11:00 PM' },
      { name: 'RENIGUNTA JN', time: '02:15 AM' },
      { name: 'WADI JUNCTION', time: '10:45 AM' },
      { name: 'SOLAPUR STATION', time: '02:30 PM' },
      { name: 'PUNE TERMINAL', time: '08:15 PM' },
    ],
    distance: '1,080 KM',
    travelTime: '21H 15M',
  },
];

const INITIAL_CHARTER_DATA: Record<string, number> = {
  'UC_001': 170,
  'UC_002': 84,
  'UC_003': 184,
  'UC_004': 130,
  'UC_005': 80,
  'UC_006': 184,
  'UC_007': 30,
};

const INITIAL_HISTORY: Booking[] = [
  {
    pnr: 'PNR_2025_MAA_001',
    routeId: 'UC_001',
    bookingDate: 'WED, 10 DEC 2025',
    journeyDate: 'FRI, 12 DEC 2025',
    status: 'COMPLETED',
    coachLabel: '3A_AC'
  }
];

const COACH_TYPES = [
  { id: 'SLEEPER', label: 'SLEEPER', multiplier: 1 },
  { id: '3A_AC', label: '3A_AC', multiplier: 1.5714285714285714 },
  { id: '2A_AC', label: '2A_AC', multiplier: 2.1224489795918366 },
];

/* --- MAIN APPLICATION COMPONENT --- */
/* Manages the multi-step booking workflow and global application state */
export default function App() {
  /* --- STATE MANAGEMENT --- */
  const [step, setStep] = useState(1);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [selectedCoach, setSelectedCoach] = useState(COACH_TYPES[0]);
  const [buddyId, setBuddyId] = useState('');
  const [showTicket, setShowTicket] = useState(false);
  const [time, setTime] = useState(new Date());
  const [charterData, setCharterData] = useState(INITIAL_CHARTER_DATA);
  const [userHasActiveBooking, setUserHasActiveBooking] = useState(false);
  const [activeBookingRouteId, setActiveBookingRouteId] = useState<string | null>(null);
  const [pnrStatus, setPnrStatus] = useState<'BOOKED' | 'CANCELLED_BY_USER'>('BOOKED');
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);
  const [bookingHistory, setBookingHistory] = useState<Booking[]>(INITIAL_HISTORY);
  const [viewingBooking, setViewingBooking] = useState<Booking | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-GB', { hour12: false }).toUpperCase() + ' HRS';
  };

  /* --- CORE LOGIC --- */
  /* Handles route selection, booking confirmation, and cancellation */
  const handleSelectRoute = (route: Route) => {
    if (userHasActiveBooking) return;
    setSelectedRoute(route);
    setStep(2);
  };

  const handleConfirmBooking = () => {
    if (!selectedRoute) return;
    
    const pnr = `PNR_2026_MAA_${selectedRoute.id.split('_')[1]}`;
    
    // Update central data state
    setCharterData(prev => ({
      ...prev,
      [selectedRoute.id]: prev[selectedRoute.id] + 1
    }));
    
    // Add to history
    const newBooking: Booking = {
      pnr,
      routeId: selectedRoute.id,
      bookingDate: 'TUE, 31 MAR 2026',
      journeyDate: selectedRoute.date,
      status: 'BOOKED',
      coachLabel: selectedCoach.label
    };
    setBookingHistory(prev => [newBooking, ...prev]);
    setViewingBooking(newBooking);
    
    // Lock booking for this user
    setUserHasActiveBooking(true);
    setActiveBookingRouteId(selectedRoute.id);
    setPnrStatus('BOOKED');
    
    // Proceed to success screen
    setStep(4);
  };

  const cancelBooking = () => {
    if (!activeBookingRouteId) return;
    
    // Decrement seat count
    setCharterData(prev => ({
      ...prev,
      [activeBookingRouteId]: prev[activeBookingRouteId] - 1
    }));

    // Update history status
    setBookingHistory(prev => prev.map(b => 
      (b.routeId === activeBookingRouteId && b.status === 'BOOKED') 
        ? { ...b, status: 'CANCELLED' } 
        : b
    ));

    // Reset user state
    setUserHasActiveBooking(false);
    setActiveBookingRouteId(null);
    setSelectedRoute(null);
    setPnrStatus('CANCELLED_BY_USER');
    setIsConfirmingCancel(false);
    setStep(1);
  };

  const calculateTotal = () => {
    if (!selectedRoute) return 0;
    const base = selectedRoute.fare * selectedCoach.multiplier;
    const subsidy = base * 0.15;
    return base - subsidy;
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      {/* --- HEADER SECTION --- */}
      {/* Contains branding, process navigation, and system status */}
      <header className="border-b-2 border-midnight bg-white p-4 flex justify-between items-center sticky top-0 z-50 no-print">
        {/* Branding (Left) */}
        <div className="flex items-center gap-3">
          <h1 className="text-xl md:text-2xl">UNIVERSITY TRANSIT PORTAL</h1>
          <span className="text-midnight opacity-40">|</span>
          <span className="font-mono text-[10px] md:text-xs opacity-60 uppercase">TRANSPORTATION SERVICES</span>
        </div>

        {/* Process Map (Center) */}
        <nav className="hidden md:flex items-center gap-4 font-mono text-[10px] lg:text-xs">
          {[
            { id: 1, label: '01 DASHBOARD' },
            { id: 2, label: '02 ITINERARY' },
            { id: 3, label: '03 BOOKING' },
            { id: 4, label: '04 TICKET' }
          ].map((s, i, arr) => (
            <div key={s.id} className="flex items-center gap-2 lg:gap-4">
              <span className={step === s.id ? 'text-terracotta font-bold' : 'text-midnight opacity-40'}>
                {s.label}
              </span>
              {i < arr.length - 1 && <span className="text-midnight opacity-20">//</span>}
            </div>
          ))}
        </nav>

        {/* System Data (Right) */}
        <div className="flex items-center gap-3 font-mono text-[10px] md:text-xs">
          <button 
            onClick={() => setStep(5)}
            className={`px-3 py-1 arch-border transition-colors ${step === 5 ? 'bg-terracotta text-white' : 'bg-white text-midnight hover:bg-stone-grey'}`}
          >
            [ HISTORY ]
          </button>
          <div className="hidden lg:block opacity-60">STATUS: ENCRYPTED</div>
          <div className="hidden sm:block">[ {formatTime(time)} ]</div>
          <div className="bg-midnight text-stone-grey px-3 py-1">
            [ ID: 2026_CS_042 ]
          </div>
        </div>
      </header>

      <main className="flex-grow p-4 md:p-8 max-w-7xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {/* --- STEP 1: DISCOVERY DASHBOARD --- */}
          {/* Displays available routes and active booking status */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8 no-print"
            >
              {/* ACTIVE_BOOKING PANEL */}
              {userHasActiveBooking && activeBookingRouteId && (
                <div className="arch-card bg-white border-midnight p-6 flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="space-y-1 text-center md:text-left">
                    <div className="font-sans font-bold text-lg uppercase">
                      ACTIVE BOOKING: CHENNAI ➔ {ROUTES.find(r => r.id === activeBookingRouteId)?.destination}
                    </div>
                    <div className="font-mono text-xs opacity-60 uppercase">
                      PNR ID: [ PNR_2026_MAA_{activeBookingRouteId.split('_')[1]} ] // STATUS: {pnrStatus}
                    </div>
                  </div>
                  <div className="flex gap-4 w-full md:w-auto">
                    {!isConfirmingCancel ? (
                      <>
                        <button 
                          onClick={() => {
                            const route = ROUTES.find(r => r.id === activeBookingRouteId);
                            const booking = bookingHistory.find(b => b.routeId === activeBookingRouteId && b.status === 'BOOKED');
                            setSelectedRoute(route || null);
                            setViewingBooking(booking || null);
                            setStep(4);
                            setShowTicket(true);
                          }}
                          className="arch-button arch-button-primary flex-grow md:flex-grow-0"
                        >
                          [ VIEW_TICKET ]
                        </button>
                        <button 
                          onClick={() => setIsConfirmingCancel(true)}
                          className="arch-button border-midnight bg-white text-midnight flex-grow md:flex-grow-0"
                        >
                          [ CANCEL_BOOKING ]
                        </button>
                      </>
                    ) : (
                      <div className="flex items-center gap-4 bg-stone-grey/50 p-2 arch-border">
                        <span className="font-mono text-[10px] font-bold text-terracotta px-2">
                          PROCEED WITH BOOKING CANCELLATION? THIS ACTION IS PERMANENT.
                        </span>
                        <button 
                          onClick={cancelBooking}
                          className="arch-button bg-alert-red text-white py-1 px-3 text-xs"
                        >
                          [ YES_CANCEL ]
                        </button>
                        <button 
                          onClick={() => setIsConfirmingCancel(false)}
                          className="arch-button bg-white text-midnight py-1 px-3 text-xs"
                        >
                          [ NO_KEEP ]
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-end border-b-2 border-midnight pb-4">
                <div className="space-y-1">
                  <h2 className="text-4xl uppercase">Available Routes</h2>
                  {userHasActiveBooking && (
                    <div className="font-mono text-xs text-terracotta font-bold uppercase">
                      RESTRICTION: ONLY ONE ACTIVE BOOKING PER STUDENT ID PERMITTED
                    </div>
                  )}
                </div>
                <span className="font-mono text-sm opacity-60 uppercase">ORIGIN: CHENNAI (MAA)</span>
              </div>

              <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
                {ROUTES.map((route) => {
                  const reservedCount = charterData[route.id];
                  const capacityPercent = Math.round((reservedCount / route.totalSeats) * 100);
                  
                  return (
                    <div key={route.id} className={`arch-card flex flex-col h-full ${userHasActiveBooking ? 'opacity-70 grayscale-[0.5]' : ''}`}>
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex flex-col">
                          <h3 className="text-2xl leading-tight">CHENNAI ➔ {route.destination}</h3>
                          <span className="font-mono text-[10px] opacity-60 uppercase">{route.trainName} // {route.charterId} // {route.trainNumber}</span>
                        </div>
                        <span className="font-mono text-xs border border-midnight px-1 uppercase">[{route.id}]</span>
                      </div>
                      
                      <div className="space-y-2 mb-6 flex-grow">
                        <div className="flex justify-between font-mono text-sm">
                          <span>JOURNEY DATE:</span>
                          <span className="font-bold">[{route.date}]</span>
                        </div>
                        <div className="flex justify-between font-mono text-sm">
                          <span>DEPARTURE:</span>
                          <span className="font-bold">[{route.departure}]</span>
                        </div>
                        <div className="flex justify-between font-mono text-sm">
                          <span>BASE FARE:</span>
                          <span className="font-bold">₹{route.fare}</span>
                        </div>
                      </div>

                      <div className="space-y-2 mb-6">
                        <div className="flex justify-between font-mono text-xs uppercase">
                          <span>CAPACITY</span>
                          <span>{capacityPercent}%</span>
                        </div>
                        <div className="progress-bar-container">
                          <div 
                            className="progress-bar-fill" 
                            style={{ width: `${capacityPercent}%` }}
                          />
                        </div>
                      </div>

                      <button 
                        onClick={() => handleSelectRoute(route)}
                        disabled={userHasActiveBooking}
                        className={`arch-button w-full ${userHasActiveBooking ? 'bg-stone-grey text-midnight opacity-50 cursor-not-allowed' : 'arch-button-primary'}`}
                      >
                        {userHasActiveBooking ? '[ BOOKING_LIMIT_REACHED ]' : '[ SHOW_DETAILS ]'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* --- STEP 2: ITINERARY & DETAILS --- */}
          {/* Detailed journey timeline and route summary */}
          {step === 2 && selectedRoute && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8 no-print"
            >
              <div className="flex items-center gap-4 border-b-2 border-midnight pb-4">
                <button 
                  onClick={() => setStep(1)}
                  className="arch-button flex items-center gap-2"
                >
                  <ArrowLeft size={16} /> [ RETURN ]
                </button>
                <h2 className="text-3xl">CHENNAI ➔ {selectedRoute.destination}</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Train Meta Card */}
                  <div className="bg-white border-2 border-midnight p-6">
                    <div className="flex justify-between items-end mb-4">
                      <div>
                        <label className="font-mono font-bold uppercase block text-2xl leading-none">
                          {selectedRoute.trainName}
                        </label>
                        <span className="font-mono text-xs opacity-60 uppercase">{selectedRoute.charterId} // {selectedRoute.trainNumber}</span>
                        <div className="mt-2 font-mono text-xs font-bold text-terracotta">
                          DATE OF JOURNEY: {selectedRoute.date}
                        </div>
                      </div>
                      <div className="font-mono text-sm">
                        {charterData[selectedRoute.id]} / {selectedRoute.totalSeats} BOOKED
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="font-mono text-[10px] opacity-60 uppercase tracking-tighter">// LIVE DEMAND AGGREGATION</div>
                      <div className="h-[10px] w-full border-2 border-midnight bg-stone-grey overflow-hidden">
                        <div 
                          className="h-full bg-terracotta" 
                          style={{ width: `${Math.round((charterData[selectedRoute.id] / selectedRoute.totalSeats) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="arch-card">
                    <h3 className="text-xl mb-6 border-b border-midnight pb-2 uppercase">Journey Timeline</h3>
                    <div className="space-y-0">
                      {selectedRoute.stops.map((stop, index) => (
                        <div key={index} className="flex gap-6">
                          <div className="flex flex-col items-center">
                            <div className="w-4 h-4 arch-border bg-midnight" />
                            {index !== selectedRoute.stops.length - 1 && (
                              <div className="w-0.5 h-16 bg-midnight" />
                            )}
                          </div>
                          <div className="pb-8">
                            <div className="font-mono text-sm font-bold">[{stop.time}]</div>
                            <div className="font-sans font-bold text-lg uppercase">{stop.name}</div>
                            {index === 0 && <div className="text-xs opacity-60 uppercase font-mono mt-1">ORIGIN POINT</div>}
                            {index === selectedRoute.stops.length - 1 && <div className="text-xs opacity-60 uppercase font-mono mt-1">FINAL DESTINATION</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="arch-card flex items-center gap-4">
                      <div className="p-3 arch-border bg-stone-grey">
                        <BaggageClaim size={24} />
                      </div>
                      <div>
                        <div className="font-sans font-bold uppercase">Baggage Allowance</div>
                        <div className="font-mono text-sm uppercase">[ 25KG CHECK-IN + 7KG CABIN ]</div>
                      </div>
                    </div>
                    <div className="arch-card flex items-center gap-4">
                      <div className="p-3 arch-border bg-stone-grey">
                        <Utensils size={24} />
                      </div>
                      <div>
                        <div className="font-sans font-bold uppercase">Meal Inclusions</div>
                        <div className="font-mono text-sm uppercase">[ 2X MEAL + 1X SNACK ]</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="lg:sticky lg:top-24 space-y-6">
                  <div className="arch-card bg-midnight text-stone-grey">
                    <h3 className="text-xl mb-4 text-stone-grey uppercase">Route Summary</h3>
                    <div className="space-y-4 font-mono">
                      <div className="flex justify-between border-b border-stone-grey/20 pb-2">
                        <span>TOTAL DISTANCE</span>
                        <span>{selectedRoute.distance}</span>
                      </div>
                      <div className="flex justify-between border-b border-stone-grey/20 pb-2">
                        <span>ESTIMATED TRAVEL TIME</span>
                        <span>{selectedRoute.travelTime}</span>
                      </div>
                      <div className="flex justify-between border-b border-stone-grey/20 pb-2">
                        <span>STARTING FARE</span>
                        <span>₹{(selectedRoute.fare * 0.85 + 45).toFixed(0)} (SLEEPER BASE)</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setStep(3)}
                      className="arch-button w-full mt-8 text-xl py-4 bg-white text-midnight hover:bg-terracotta hover:text-white uppercase"
                    >
                      [ GO_TO_BOOKING ]
                    </button>
                  </div>
                  
                  <div className="arch-card border-dashed">
                    <div className="flex gap-2 items-start opacity-60">
                      <div className="mt-1 flex-shrink-0"><Info size={16} /></div>
                      <p className="text-xs font-mono">
                        THIS IS A UNIVERSITY CHARTERED SERVICE. FARES ARE SUBSIDIZED BY THE ACADEMIC COUNCIL.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* --- STEP 3: CONFIGURATION & CHECKOUT --- */}
          {/* Passenger preferences and final fare computation */}
          {step === 3 && selectedRoute && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto space-y-8 no-print"
            >
              <div className="flex items-center gap-4 border-b-2 border-midnight pb-4">
                <button 
                  onClick={() => setStep(2)}
                  className="arch-button flex items-center gap-2"
                >
                  <ArrowLeft size={16} /> [ RETURN ]
                </button>
                <h2 className="text-3xl uppercase">Passenger Configuration</h2>
              </div>

              <div className="space-y-6">
                {/* PASSENGER DETAILS */}
                <div className="arch-card bg-white border-midnight p-4 space-y-4">
                  <label className="font-sans font-bold uppercase block">Passenger Details</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="font-mono text-[10px] opacity-60 uppercase block">NAME</label>
                      <div className="bg-stone-grey border border-midnight/20 p-2 font-mono text-xs">[ STUDENT_042 ]</div>
                    </div>
                    <div className="space-y-1">
                      <label className="font-mono text-[10px] opacity-60 uppercase block">STUDENT ID</label>
                      <div className="bg-stone-grey border border-midnight/20 p-2 font-mono text-xs">[ 2026_CS_042 ]</div>
                    </div>
                    <div className="space-y-1">
                      <label className="font-mono text-[10px] opacity-60 uppercase block">STATUS</label>
                      <div className="bg-stone-grey border border-midnight/20 p-2 font-mono text-xs text-terracotta font-bold">[ SUBSIDY_ELIGIBLE ]</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="font-sans font-bold uppercase block">Coach Preference</label>
                  <div className="grid grid-cols-3 gap-4">
                    {COACH_TYPES.map((coach) => (
                      <button
                        key={coach.id}
                        onClick={() => setSelectedCoach(coach)}
                        className={`arch-button py-4 ${selectedCoach.id === coach.id ? 'bg-terracotta text-white' : ''}`}
                      >
                        [ {coach.label} ]
                      </button>
                    ))}
                  </div>
                </div>

                <div className="arch-card space-y-4">
                  <label className="font-sans font-bold uppercase block">Link Travel Buddy (Optional)</label>
                  <input 
                    type="text"
                    value={buddyId}
                    onChange={(e) => setBuddyId(e.target.value)}
                    placeholder="[ e.g., 2026_XX_123 ]"
                    className="w-full arch-border p-4 bg-stone-grey focus:outline-none focus:bg-white transition-colors uppercase"
                  />
                  <p className="text-xs font-mono opacity-60">
                    * BUDDY MUST BE A REGISTERED UNIVERSITY STUDENT.
                  </p>
                </div>

                <div className="arch-card">
                  <h3 className="text-xl mb-4 uppercase">Final Fare Computation</h3>
                  <table className="w-full font-mono text-sm">
                      <tbody className="divide-y divide-midnight/10">
                        <tr>
                          <td className="py-2">BASE FARE ({selectedCoach.id})</td>
                          <td className="py-2 text-right">₹{(selectedRoute.fare * selectedCoach.multiplier).toFixed(0)}</td>
                        </tr>
                        <tr>
                          <td className="py-2">UNIVERSITY SUBSIDY (-15%)</td>
                          <td className="py-2 text-right text-terracotta">- ₹{(selectedRoute.fare * selectedCoach.multiplier * 0.15).toFixed(0)}</td>
                        </tr>
                        <tr>
                          <td className="py-2">SERVICE FEE</td>
                          <td className="py-2 text-right">₹45</td>
                        </tr>
                        <tr className="text-lg font-bold">
                          <td className="py-4">TOTAL PAYABLE</td>
                          <td className="py-4 text-right">₹{(calculateTotal() + 45).toFixed(0)}</td>
                        </tr>
                      </tbody>
                  </table>
                </div>

                <button 
                  onClick={handleConfirmBooking}
                  className="arch-button arch-button-primary w-full py-6 text-2xl"
                >
                  [ CONFIRM_AND_BOOK ]
                </button>
              </div>
            </motion.div>
          )}

          {/* --- STEP 4: SUCCESS & DIGITAL TICKET --- */}
          {/* Confirmation screen and printable E-Ticket (ERS) */}
          {step === 4 && selectedRoute && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl mx-auto space-y-8 text-center"
            >
              {!showTicket ? (
                <div className="space-y-8 no-print">
                  <div className="bg-sage text-stone-grey p-12 arch-border flex flex-col items-center gap-6">
                    <CheckCircle2 size={64} />
                    <h2 className="text-4xl uppercase">Seat Booked Successfully</h2>
                    <p className="font-mono uppercase text-sm">
                      Transaction ID: [ TXN_99283_ARCH ]
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button 
                      onClick={() => setShowTicket(true)}
                      className="arch-button arch-button-primary py-4"
                    >
                      [ VIEW_TICKET ]
                    </button>
                    <button 
                      onClick={() => {
                        setStep(1);
                        setShowTicket(false);
                        setBuddyId('');
                        setViewingBooking(null);
                      }}
                      className="arch-button py-4 no-print"
                    >
                      [ RETURN_TO_DASHBOARD ]
                    </button>
                  </div>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white arch-border p-0 text-left overflow-hidden relative ticket-container"
                >
                  {/* Boarding Pass Design */}
                  <div className="p-8 space-y-8">
                    <div className="flex justify-between items-start border-b-2 border-midnight pb-6">
                      <div>
                        <h2 className="text-3xl uppercase">Boarding Pass</h2>
                        <p className="font-mono text-xs opacity-60">UNIVERSITY CHARTER TRANSIT SYSTEM</p>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-xl font-bold">[{viewingBooking?.pnr || selectedRoute.id}]</div>
                        <div className="font-mono text-xs uppercase">PNR REFERENCE</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-y-8 gap-x-12">
                      <div>
                        <label className="font-mono text-xs opacity-60 uppercase block mb-1">Passenger</label>
                        <div className="font-sans font-bold text-xl">STUDENT_USER_042</div>
                        <div className="font-mono text-xs">[ ID: 2026_CS_042 ]</div>
                      </div>
                      <div>
                        <label className="font-mono text-xs opacity-60 uppercase block mb-1">Coach Type</label>
                        <div className="font-sans font-bold text-xl uppercase">{viewingBooking?.coachLabel || selectedCoach.label}</div>
                        <div className="font-mono text-xs">[ SEAT: AUTO_ASSIGN ]</div>
                      </div>
                      <div>
                        <label className="font-mono text-xs opacity-60 uppercase block mb-1">Origin</label>
                        <div className="font-sans font-bold text-xl uppercase">CHENNAI</div>
                        <div className="font-mono text-xs">[ CAMPUS_STATION ]</div>
                      </div>
                      <div>
                        <label className="font-mono text-xs opacity-60 uppercase block mb-1">Destination</label>
                        <div className="font-sans font-bold text-xl uppercase">{selectedRoute.destination}</div>
                        <div className="font-mono text-xs">[ {selectedRoute.destination}_TERM ]</div>
                      </div>
                      <div className="col-span-2 border-t border-midnight/10 pt-4">
                        <label className="font-mono text-xs opacity-60 uppercase block mb-1">Trip Details</label>
                        <div className="flex justify-between items-end">
                          <div>
                            <div className="font-mono text-[10px] text-midnight uppercase mb-1 font-bold">
                              {selectedRoute.trainName} // {selectedRoute.charterId} // {selectedRoute.trainNumber}
                            </div>
                            <div className="font-sans font-black text-2xl uppercase text-midnight">JOURNEY DATE: {viewingBooking?.journeyDate || selectedRoute.date}</div>
                            <div className="font-mono text-xs font-bold">[ DEPARTURE: {selectedRoute.departure} ]</div>
                          </div>
                          {buddyId && (
                            <div className="text-right">
                              <label className="font-mono text-[10px] opacity-60 uppercase block">Linked Buddy</label>
                              <div className="font-sans font-bold text-base uppercase">{buddyId}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Perforation */}
                  <div className="border-t-2 border-dashed border-midnight my-4 relative">
                    {viewingBooking?.status === 'COMPLETED' && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="border-4 border-terracotta text-terracotta font-black text-4xl px-4 py-2 rotate-[-15deg] opacity-20">
                          TRIP_COMPLETED
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-8 pt-4 space-y-6">
                    <div className="flex flex-col items-center space-y-6">
                      <div className="barcode flex justify-center w-full">
                        {[2, 4, 1, 3, 2, 5, 1, 2, 4, 2, 1, 3, 4, 1, 2, 3, 5, 1, 2, 4, 1, 3, 2, 4, 1, 3, 2, 5, 1, 2, 4, 2, 1, 3, 4, 1, 2, 3, 5, 1, 2, 4, 1, 3].map((w, i) => (
                          <div key={i} className="barcode-line" style={{ width: `${w}px` }} />
                        ))}
                      </div>
                      
                      <div className="flex justify-between items-end w-full">
                        <div className="space-y-4 flex-grow">
                          <p className="text-[10px] font-mono leading-tight opacity-60 max-w-md">
                            UNIVERSITY POLICY: THIS TICKET IS NON-TRANSFERABLE. VALID UNIVERSITY ID MUST BE PRESENTED UPON BOARDING. 
                            CHARTER SERVICES ARE SUBJECT TO ACADEMIC CALENDAR ADJUSTMENTS.
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0 flex flex-col justify-between">
                          <div>
                            <div className="font-mono text-sm font-bold">{viewingBooking?.bookingDate || 'TUE, 31_MAR_2026'}</div>
                            <div className="font-mono text-xs uppercase">Issue Date</div>
                          </div>
                          <button 
                            onClick={() => window.print()}
                            className="arch-button border-2 border-midnight bg-transparent text-[10px] py-1 px-2 mt-4 no-print"
                          >
                            [ PRINT_ERS_DOCUMENT ]
                          </button>
                        </div>
                      </div>

                      <div className="text-[10px] font-mono uppercase opacity-60 text-center w-full pt-4 border-t border-midnight/10">
                        OFFICIAL UNIVERSITY DOCUMENT // SYSTEM GENERATED NO SIGNATURE REQUIRED
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      setStep(1);
                      setShowTicket(false);
                      setViewingBooking(null);
                    }}
                    className="w-full bg-midnight text-white py-2 font-mono text-xs uppercase hover:bg-terracotta transition-colors no-print"
                  >
                    [ CLOSE_TICKET_VIEW ]
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* --- STEP 5: BOOKING HISTORY --- */}
          {/* Tabular view of all past and current bookings */}
          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8 no-print"
            >
              <div className="flex items-center gap-4 border-b-2 border-midnight pb-4">
                <button 
                  onClick={() => setStep(1)}
                  className="arch-button flex items-center gap-2"
                >
                  <ArrowLeft size={16} /> [ RETURN ]
                </button>
                <h2 className="text-3xl uppercase">Booking History</h2>
              </div>

              <div className="arch-card p-0 overflow-hidden">
                <table className="w-full text-left border-collapse font-mono text-sm">
                  <thead className="bg-midnight text-stone-grey uppercase text-[10px]">
                    <tr>
                      <th className="p-4 border-r border-stone-grey/20">BOOKING DATE</th>
                      <th className="p-4 border-r border-stone-grey/20">JOURNEY DATE</th>
                      <th className="p-4 border-r border-stone-grey/20">ROUTE</th>
                      <th className="p-4 border-r border-stone-grey/20">PNR ID</th>
                      <th className="p-4 border-r border-stone-grey/20">STATUS</th>
                      <th className="p-4">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-midnight/10">
                    {bookingHistory.map((booking, idx) => {
                      const route = ROUTES.find(r => r.id === booking.routeId);
                      return (
                        <tr key={idx} className="hover:bg-stone-grey/30 transition-colors">
                          <td className="p-4 border-r border-midnight/10">{booking.bookingDate}</td>
                          <td className="p-4 border-r border-midnight/10 font-black text-midnight">{booking.journeyDate}</td>
                          <td className="p-4 border-r border-midnight/10 uppercase">
                            MAA ➔ {route?.destination}
                          </td>
                          <td className="p-4 border-r border-midnight/10">[{booking.pnr}]</td>
                          <td className="p-4 border-r border-midnight/10">
                            <span className={`px-2 py-0.5 text-[10px] font-bold ${
                              booking.status === 'BOOKED' ? 'bg-sage text-white' : 
                              booking.status === 'CANCELLED' ? 'bg-alert-red text-white' : 
                              'bg-midnight text-stone-grey'
                            }`}>
                              {booking.status}
                            </span>
                          </td>
                          <td className="p-4">
                            {(booking.status === 'BOOKED' || booking.status === 'COMPLETED') && (
                              <button 
                                onClick={() => {
                                  setSelectedRoute(route || null);
                                  setViewingBooking(booking);
                                  setStep(4);
                                  setShowTicket(true);
                                }}
                                className="text-terracotta hover:underline font-bold"
                              >
                                [ VIEW_TICKET ]
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-midnight p-4 bg-white no-print">
        <div className="max-w-7xl mx-auto flex justify-between items-center font-mono text-[10px] md:text-xs opacity-60 uppercase">
          <span>© 2026 UNIVERSITY TRANSIT AUTHORITY</span>
          <span className="hidden md:inline">SYSTEM STATUS: [ OPERATIONAL ]</span>
          <span>TERMINAL: [ MAA_MAIN_01 ]</span>
        </div>
      </footer>
    </div>
  );
}
