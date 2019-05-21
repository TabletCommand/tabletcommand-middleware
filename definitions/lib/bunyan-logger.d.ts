import bunyan from "bunyan";
import * as express from 'express';
export declare function logger(name: string, filePath: string, logToConsole: boolean): bunyan;
export declare function middleware(loggerInstance: InstanceType<typeof bunyan>): (req: express.Request, res: express.Response, next: express.NextFunction) => void;
//# sourceMappingURL=bunyan-logger.d.ts.map