import { DepartmentModel } from 'tabletcommand-backend-models';
import express from 'express';
export declare function customSession(Department: DepartmentModel): (req: express.Request, res: express.Response, next: express.NextFunction) => Promise<void>;
export default customSession;
//# sourceMappingURL=signup-session.d.ts.map