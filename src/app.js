import express from "express";
import cors from "cors";
import { router as apiRoutes} from "./routes/index.js";
import helmet from "helmet";
import cookieParser  from "cookie-parser";
import { limiter } from "./middlewares/rateLimiter.js";



export const app = express();

app.set("trust proxy", 1)

// Global middleware ,set HTTP header
app.use(helmet());

const corsOptions = {
    origin: [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "https://frontend-express-app-new.vercel.app", //frontend domain
    ],
    credentials: true // ✅allow cookies to be sent
};

// install middlewares

app.use(cors(corsOptions));

app.use(limiter)

app.use(express.json());

// Middleware to parse cookies (required for cookie-base authentication)
app.use(cookieParser());

app.get("/", (req, res)=>{
    res.send("Hello World")
});

app.use("/api", apiRoutes);

// Catch-all for 404 Not Found
app.use((req, res, next) => {
    const error = new Error(`Not found: ${req.method} ${req.originalUrl}`);
    error.name = error.name || "NotFoundError";
    error.staus = error.status || 404;
    next(error);
})

// Centralized Errpr Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);  // logเพื่อดูerror
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error", 
        path: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString(),
        stack: err.stack ,
    });
});