import { initialSpaces, users } from './data';

const SPACE_KEY = 'parkly.spaces.v1';
const RESERVATION_KEY = 'parkly.reservations.v1';

function read(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export const mockRepository = {
  getUsers: () => users,
  getSpaces: () => read(SPACE_KEY, initialSpaces),
  getReservations: () => read(RESERVATION_KEY, []),
  addSpace(space) {
    const next = [space, ...this.getSpaces()];
    write(SPACE_KEY, next);
    return space;
  },
  addReservation(reservation) {
    const next = [reservation, ...this.getReservations()];
    write(RESERVATION_KEY, next);
    return reservation;
  },
};

export function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
