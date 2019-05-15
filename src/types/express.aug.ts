import { Department, User, Session } from "tabletcommand-backend-models";
import { UserInfo } from "../middleware/token-session";

declare global  {

    namespace Express {
        interface Request {
            statsdKey: string;
            user: UserInfo;
            department: Department;
            departmentLog: unknown;
            session: Session;
            login: Session;
            seneca: {
                login: Session;
                user: UserInfo;
            };
        }
        interface Response {
            _header: boolean;
        }
    }
}
