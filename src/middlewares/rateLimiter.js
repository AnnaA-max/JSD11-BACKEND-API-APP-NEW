import rateLimit from "express-rate-limit";

// กำหนดว่าติดต่อได้กี่ครั้ง , set config
export const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,// 15 minnute
    max: 100, // limit each IP address to 100 requests per  15 minutes
    standardHeaders: true, // use header new version
    legacyHeaders: false, 
})