import express from "express";
import bodyParser from "body-parser";
import fs from "fs";
import routes from "./routes";
import cors from "cors";

var app = express();
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(cors());

app.use('/', routes);

app.use((err: any, req: any, res: any, next: any) => {
    const status = (err.name == "AuthError") ? 401 : 400;
    res.status(status).json({
        success: false,
        message: err.message ? err.message : err
    });
});

export { app }