// MANAGER CONFIGURATION FILE
// Edit the values below to update the offers displayed on the website.
// The `minNights`, `discountValue`, and `freeNights` directly affect the booking calculator.

export const OFFERS = [
  {
    id: 1,
    title: "Loyalty Programme",
    shortDesc: "Book 10 nights and get one night free.",
    fullDesc: "After booking with us for 10 nights, you get a night for free on us. Experience the best of Lulu Aurelian Estate.",
    image: "/loyalty.jpg",
    action: "Book Now",
    discountType: "free_nights", // Options: 'percentage', 'fixed', 'free_nights'
    minNights: 10,
    freeNights: 1
    // MANAGER NOTE: Change the minNights and freeNights above to adjust the Loyalty Programme offer
  },
  {
    id: 2,
    title: "Weekly Stay Discount",
    shortDesc: "Book for 7 nights and get a 10% discount.",
    fullDesc: "Stay with us for an entire week (7days) and enjoy a 10% discount on your booking. A perfect getaway for longer stays.",
    image: "/weekly.jpg",
    action: "Book Now",
    discountType: "percentage",
    minNights: 7,
    discountValue: 10
    // MANAGER NOTE: Change minNights and discountValue (percentage) above to adjust the Weekly Stay offer
  },
  {
    id: 3,
    title: "Monthly Retreat",
    shortDesc: "Book for a month and get a 20% discount.",
    fullDesc: "Enjoy a whole month of luxury living with a massive 20% discount. Perfect for remote workers or extended vacations.",
    image: "/monthly.jpg",
    action: "Book Now",
    discountType: "percentage",
    minNights: 30, // Assuming a month is 30 nights
    discountValue: 20
    // MANAGER NOTE: Change minNights and discountValue above
  },

  {
    id: 5,
    title: "Corporate Packages",
    shortDesc: "Book more than one suite and get a 10% discount.",
    fullDesc: "Special rates for group bookings. Ideal for corporate retreats, family gatherings, or large events.",
    image: "/group.jpg",
    action: "Book Now",
    discountType: "percentage",
    minNights: 1, 
    discountValue: 10
    // MANAGER NOTE: Change minNights and discountValue above
  }
];
