'use client'

const readDB = () => {
  try {
    const data = localStorage.getItem('foodWasteDB');
    if (data) {
      return JSON.parse(data);
    }
    const initialData = {
      users: [],
      reports: [],
      rewards: [],
      collectedWastes: [],
      notifications: [],
      transactions: []
    };
    localStorage.setItem('foodWasteDB', JSON.stringify(initialData));
    return initialData;
  } catch (error) {
    console.error('Error reading from database:', error);
    return {
      users: [],
      reports: [],
      rewards: [],
      collectedWastes: [],
      notifications: [],
      transactions: []
    };
  }
}

const writeDB = (data) => {
  try {
    localStorage.setItem('foodWasteDB', JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error writing to database:', error);
    return false;
  }
}

export const db = {
  read: readDB,
  write: writeDB
};
