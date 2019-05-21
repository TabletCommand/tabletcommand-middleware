import * as express from 'express';
export declare function authDepartment(req: express.Request, res: express.Response, next: express.NextFunction): void;
export declare const auth: typeof authDepartment;
export declare function authSuper(req: express.Request, res: express.Response, next: express.NextFunction): void;
export declare function authUser(req: express.Request, res: express.Response, next: express.NextFunction): void;
export declare function notFoundHandler(req: express.Request, res: express.Response, next: express.NextFunction): void;
export declare function notImplementedHandler(req: express.Request, res: express.Response, next: express.NextFunction): void;
export declare function developmentErrorHandler(err: Error, req: express.Request, res: express.Response, next: express.NextFunction): void;
export declare function productionErrorHandler(err: Error, req: express.Request, res: express.Response, next: express.NextFunction): void;
//# sourceMappingURL=common.d.ts.map