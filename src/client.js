import { config } from "./config.js";
import Eris from "eris";

export const client = new Eris(config.token);
