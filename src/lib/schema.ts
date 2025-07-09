import {
  mysqlTable,
  varchar,
  datetime,
  text,
  primaryKey,
  decimal,
  int,
  json,
  boolean,
} from 'drizzle-orm/mysql-core';

// ✅ User table (required)
export const user = mysqlTable('user', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  emailVerified: datetime('emailVerified'),
  image: text('image'),
});

// ✅ Accounts table (OAuth support: Google, Facebook)
export const account = mysqlTable(
  'account',
  {
    userId: varchar('userId', { length: 255 }).notNull(),
    type: varchar('type', { length: 255 }).notNull(),
    provider: varchar('provider', { length: 255 }).notNull(),
    providerAccountId: varchar('providerAccountId', { length: 255 }).notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: datetime('expires_at'),
    token_type: varchar('token_type', { length: 255 }),
    scope: varchar('scope', { length: 255 }),
    id_token: text('id_token'),
    session_state: varchar('session_state', { length: 255 }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.provider, table.providerAccountId] }),
  })
);

// ✅ Sessions table (for session-based auth, even if using JWT)
export const sessions = mysqlTable('sessions', {
  sessionToken: varchar('sessionToken', { length: 255 }).primaryKey(),
  userId: varchar('userId', { length: 255 }).notNull(),
  expires: datetime('expires').notNull(),
});

// ✅ Verification tokens (for email OTP, magic links)
export const verification_tokens = mysqlTable(
  'verification_tokens',
  {
    identifier: varchar('identifier', { length: 255 }).notNull(),
    token: varchar('token', { length: 255 }).notNull(),
    otp: varchar('otp', { length: 255 }).notNull(),
    expires: datetime('expires').notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.identifier, table.token, table.otp] }),
  })
);

// ✅ Hotel bookings table
export const hotelBookings = mysqlTable('hotel_bookings', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('userId', { length: 255 }).notNull(),
  hotelId: varchar('hotelId', { length: 255 }).notNull(),
  bookingReference: varchar('bookingReference', { length: 50 }).notNull().unique(),
  
  // Booking details
  hotelName: varchar('hotelName', { length: 255 }).notNull(),
  roomType: varchar('roomType', { length: 100 }).notNull(),
  checkInDate: datetime('checkInDate').notNull(),
  checkOutDate: datetime('checkOutDate').notNull(),
  nights: int('nights').notNull(),
  
  // Guest information
  guestDetails: json('guestDetails').notNull(), // {adults: number, children: number, rooms: number}
  primaryGuest: json('primaryGuest').notNull(), // {name, email, phone}
  
  // Pricing
  totalPrice: decimal('totalPrice', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('AED'),
  
  // Booking status
  status: varchar('status', { length: 20 }).notNull().default('pending'), // pending, confirmed, cancelled, completed
  paymentStatus: varchar('paymentStatus', { length: 20 }).notNull().default('pending'), // pending, paid, refunded
  
  // Additional information
  specialRequests: text('specialRequests'),
  
  // Timestamps
  createdAt: datetime('createdAt').notNull(),
  updatedAt: datetime('updatedAt').notNull(),
});

// ✅ Flight bookings table
export const flightBookings = mysqlTable('flight_bookings', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('userId', { length: 255 }).notNull(),
  flightId: varchar('flightId', { length: 255 }).notNull(),
  bookingReference: varchar('bookingReference', { length: 50 }).notNull().unique(),
  
  // Flight details
  airline: varchar('airline', { length: 100 }).notNull(),
  flightNumber: varchar('flightNumber', { length: 20 }).notNull(),
  origin: varchar('origin', { length: 10 }).notNull(),
  destination: varchar('destination', { length: 10 }).notNull(),
  departureDate: datetime('departureDate').notNull(),
  arrivalDate: datetime('arrivalDate').notNull(),
  cabinClass: varchar('cabinClass', { length: 20 }).notNull(),
  
  // Passenger information
  passengers: json('passengers').notNull(), // Array of passenger details
  
  // Pricing
  totalPrice: decimal('totalPrice', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('AED'),
  
  // Booking status
  status: varchar('status', { length: 20 }).notNull().default('pending'), // pending, confirmed, cancelled, completed
  paymentStatus: varchar('paymentStatus', { length: 20 }).notNull().default('pending'), // pending, paid, refunded
  
  // Additional services
  additionalServices: json('additionalServices'), // Array of selected services
  
  // Timestamps
  createdAt: datetime('createdAt').notNull(),
  updatedAt: datetime('updatedAt').notNull(),
});
