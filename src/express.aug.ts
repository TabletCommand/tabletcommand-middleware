import { Department, User, Session } from "tabletcommand-backend-models";

declare global  {
    namespace Express {
        interface Request {
            statsdKey: string;
            user: User;
            department: Department;
            departmentLog: unknown;
            session: Session;
            login: Session;
            seneca: {
                login: Session;
                user: User;
            }
        }
        interface Response {
            _header: boolean
        }
    }
}
