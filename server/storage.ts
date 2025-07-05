import { storage as mongoStorage } from "./mongodb";
import { FallbackStorage } from "./fallback-storage";
import type { IStorage } from "./mongodb";
import mongoose from "mongoose";

// Use fallback storage when MongoDB is not connected
const createStorage = (): IStorage => {
  if (mongoose.connection.readyState === 1) {
    console.log('Using MongoDB storage');
    return mongoStorage;
  } else {
    console.log('Using fallback storage');
    return new FallbackStorage();
  }
};

export const storage: IStorage = createStorage();