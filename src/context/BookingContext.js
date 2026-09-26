import React, { createContext, useReducer, useContext } from 'react';

// Initial state for the booking wizard
const initialState = {
  suiteId: null, // e.g., 'skyview'
  dates: { checkIn: '', checkOut: '' },
  guests: { adults: 1, children: 0 },
  bookingType: 'entire', // or 'one_bedroom'
  pricing: null, // { ratePerNight, totalCost, discounts }
  guestInfo: { name: '', email: '', phone: '' },
  addOns: [], // future extension
  step: 1, // 1=dates, 2=rate, 3=guest, 4=payment
  bookingId: null,
  secureToken: null
};

// Simple reducer to update wizard state
function reducer(state, action) {
  switch (action.type) {
    case 'SET_SUITE':
      return { ...state, suiteId: action.payload };
    case 'SET_DATES':
      return { ...state, dates: action.payload, step: 2 };
    case 'SET_GUESTS':
      return { ...state, guests: action.payload, step: 3 };
    case 'SET_BOOKING_TYPE':
      return { ...state, bookingType: action.payload };
    case 'SET_PRICING':
      return { ...state, pricing: action.payload, step: 4 };
    case 'SET_GUEST_INFO':
      return { ...state, guestInfo: action.payload, step: 4 };
    case 'SET_BOOKING_HOLD':
      return { ...state, bookingId: action.payload.bookingId, secureToken: action.payload.secureToken };
    case 'SET_STEP':
      return { ...state, step: action.payload };
    case 'NEXT_STEP':
      return { ...state, step: state.step + 1 };
    case 'PREV_STEP':
      return { ...state, step: state.step - 1 };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

const BookingContext = createContext();

export function BookingProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <BookingContext.Provider value={{ state, dispatch }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}
