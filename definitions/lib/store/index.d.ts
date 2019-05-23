/// <reference types="mongoose" />
import { DepartmentModel, SessionModel, UserModel } from "tabletcommand-backend-models";
import { RedisClient } from "redis";
export declare function store(Department: DepartmentModel, Session: SessionModel, User: UserModel, redisClient: RedisClient): {
    findDepartmentByApiKey: (apiKey: string) => Promise<{
        department: (import("mongoose").Document & {
            _id: import("bson").ObjectId;
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
        }) | null;
        cached: boolean;
    }>;
    expireDepartmentByApiKey: (apiKey: string) => Promise<number>;
    findSessionByToken: (token: string) => Promise<{
        session: (import("mongoose").Document & {
            _id: string;
            nick: string;
            email: string;
            user: string;
            active: boolean;
            token: string;
            source: string;
            departmentId: string;
            why: string;
            when: string;
            ended: string;
            userAgent: string;
            remoteAddress: string;
            deviceId: string;
        }) | null;
        user: (import("mongoose").Document & {
            nick: string;
            email: string;
            name: string;
            departmentId: string;
            modified_date: string;
            when: string;
            agency: {
                code: string;
                name: string;
                domain: string;
            };
            active: boolean;
            admin: boolean;
            superuser: boolean;
            isPro: boolean;
            outsider: boolean;
            remoteLoggingEnabled: boolean;
            salt: string;
            pass: string;
            mapHidden: boolean;
            mapId: string;
            vehicle: {
                radioName: string;
                vehicleId: string;
            };
            sessionCountiPhone: number;
            sessionCountiPad: number;
            rtsAuthKey: string;
            token: string;
            tokenExpireDate: number;
        }) | null;
        department: (import("mongoose").Document & {
            _id: import("bson").ObjectId;
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
        }) | null;
        cached: boolean;
    }>;
    expireSessionByToken: (token: string) => Promise<number>;
};
export default store;
export declare type StoreModule = ReturnType<typeof store>;
//# sourceMappingURL=index.d.ts.map