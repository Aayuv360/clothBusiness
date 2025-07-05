import { storage as mongoStorage } from "./mongodb";
import { FallbackStorage } from "./fallback-storage";
import type { IStorage } from "./mongodb";
import mongoose from "mongoose";

// Create a storage factory that returns the appropriate storage based on MongoDB connection
export const getStorage = (): IStorage => {
  if (mongoose.connection.readyState === 1) {
    console.log('Using MongoDB storage');
    return mongoStorage;
  } else {
    console.log('Using fallback storage');
    return new FallbackStorage();
  }
};

export const storage: IStorage = getStorage();