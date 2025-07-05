import { storage as mongoStorage } from "./mongodb";
import type { IStorage } from "./mongodb";

// Export the MongoDB storage instance
export const storage: IStorage = mongoStorage;