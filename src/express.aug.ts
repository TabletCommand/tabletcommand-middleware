import { Department, User, Session } from "tabletcommand-backend-models";

declare global  {
    namespace Express {
        interface Request {
            statsdKey: string;
            user: User;
            department: Department;
            session: Session;
        }
    }
}
