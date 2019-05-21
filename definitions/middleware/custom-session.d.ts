/// <reference types="mongoose" />
import { DepartmentModel, SessionModel, UserModel } from "tabletcommand-backend-models";
import express = require("express");
export declare function customSession(Department: DepartmentModel, Session: SessionModel, User: UserModel): (req: express.Request, res: express.Response, next: express.NextFunction) => void | import("mongoose").DocumentQuery<(import("mongoose").Document & {
    _id: {
        type: {
            prototype: {} | {
                [x: string]: any;
            } | {}[];
            cacheHexString?: undefined;
            createFromHexString: {};
            createFromTime: {};
            isValid: {};
            generate: {};
        };
        auto: never;
    };
    uuid: string;
    department: string;
    fdid: string;
    city: string;
    state: string;
    contact_name: string;
    contact_phone: string;
    contact_email: string;
    modified_unix_date: number;
    active: boolean;
    pager_number: string;
    apikey: string;
    cadEmailUsername: string;
    cadMonitorEnabled: boolean;
    cadMonitorMinutes: number;
    cadBidirectionalEnabled: boolean;
    heartbeatEnabled: boolean;
    heartbeatMinutes: number;
    pushEnabled: boolean;
    userContributionEnabled: boolean;
    rtsEnabled: boolean;
    rtsChannelPrefix: string;
    rtsAuthKey: string;
    esriTokenDateExpiry: number;
    esriToken: {
        access_token: string;
        refresh_token: string;
        username: string;
        ssl: boolean;
        expires_in: number;
    };
    customWebUrl: string;
    customWebName: string;
    incidentTypes: {
        name: string;
        value: string;
    }[];
    agencies: {
        code: string;
        name: string;
        domain: string;
    }[];
    signupKey: string;
    signupDomains: string[];
}) | null, import("mongoose").Document & {
    _id: {
        type: {
            prototype: {} | {
                [x: string]: any;
            } | {}[];
            cacheHexString?: undefined;
            createFromHexString: {};
            createFromTime: {};
            isValid: {};
            generate: {};
        };
        auto: never;
    };
    uuid: string;
    department: string;
    fdid: string;
    city: string;
    state: string;
    contact_name: string;
    contact_phone: string;
    contact_email: string;
    modified_unix_date: number;
    active: boolean;
    pager_number: string;
    apikey: string;
    cadEmailUsername: string;
    cadMonitorEnabled: boolean;
    cadMonitorMinutes: number;
    cadBidirectionalEnabled: boolean;
    heartbeatEnabled: boolean;
    heartbeatMinutes: number;
    pushEnabled: boolean;
    userContributionEnabled: boolean;
    rtsEnabled: boolean;
    rtsChannelPrefix: string;
    rtsAuthKey: string;
    esriTokenDateExpiry: number;
    esriToken: {
        access_token: string;
        refresh_token: string;
        username: string;
        ssl: boolean;
        expires_in: number;
    };
    customWebUrl: string;
    customWebName: string;
    incidentTypes: {
        name: string;
        value: string;
    }[];
    agencies: {
        code: string;
        name: string;
        domain: string;
    }[];
    signupKey: string;
    signupDomains: string[];
}, {}>;
export default customSession;
//# sourceMappingURL=custom-session.d.ts.map