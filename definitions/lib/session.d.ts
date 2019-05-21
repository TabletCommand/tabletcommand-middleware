/// <reference types="mongoose" />
import express = require("express");
import { StoreModule } from "./store";
export declare function session(store: StoreModule): {
    detectApiKey: (headers: Record<string, string> | null, query: Record<string, string> | null) => string;
    detectCookieSession: (cookies: Record<string, string>) => string;
    sessionCookieName: string;
    departmentForLogging: (department: import("mongoose").Document & {
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
    }) => {};
    authByApiKey: (req: express.Request, res: express.Response) => Promise<(import("mongoose").Document & {
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
    }) | null>;
    authBySenecaCookie: (req: express.Request, res: express.Response) => Promise<{
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
        }) | null;
    }>;
};
export default session;
//# sourceMappingURL=session.d.ts.map