import { DepartmentModel, SessionModel, UserModel } from "tabletcommand-backend-models";
import express = require("express");
export declare function customSession(Department: DepartmentModel, Session: SessionModel, User: UserModel): (req: express.Request, res: express.Response, next: express.NextFunction) => Promise<void>;
export default customSession;
//# sourceMappingURL=custom-session.d.ts.map