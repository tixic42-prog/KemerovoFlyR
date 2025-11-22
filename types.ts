export enum FlightStatus {
  Scheduled = 'Scheduled',
  OnTime = 'On Time',
  Delayed = 'Delayed',
  Landed = 'Landed',
  Cancelled = 'Cancelled'
}

export interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  origin: string;
  destination: string;
  scheduledTime: string; // ISO String for reliable date parsing
  estimatedTime: string; // ISO String
  status: FlightStatus;
  terminal?: string;
  gate?: string;
}

export interface FlightResponse {
  flights: Flight[];
}