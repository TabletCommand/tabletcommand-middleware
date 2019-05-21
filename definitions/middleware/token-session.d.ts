import express from "express";
export interface UserInfo {
    active: boolean;
    admin: boolean;
    outsider: boolean;
    username?: string;
    token: string;
    email: string;
    superuser?: boolean;
    departmentId?: string;
    nick?: string;
}
export declare function tokenSession(allowedTokens: Array<{
    token: string;
    username: string;
}>): (req: express.Request, res: express.Response, next: express.NextFunction) => void;
export default tokenSession;
//# sourceMappingURL=token-session.d.ts.map