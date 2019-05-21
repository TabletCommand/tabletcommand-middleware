import express = require("express");
export declare function metricsModule(filterFunction?: (p: string) => void): {
    defaultFilter: (path: string, callback: (p: string) => void) => void;
    statsd: () => (req: express.Request, res: express.Response, next: express.NextFunction) => void;
};
export default metricsModule;
//# sourceMappingURL=metrics.d.ts.map