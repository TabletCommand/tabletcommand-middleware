/// <reference types="mongoose" />
import { BackendModels, MongooseModule } from "tabletcommand-backend-models";
import { RedisClient } from "redis";
import { SimpleCallback } from "../types/types";
import { Mockgoose } from 'mockgoose';
export declare function data(mockgoose: Mockgoose, mongoose: MongooseModule, models: BackendModels, redisClient: RedisClient): {
    apiKey: string;
    token: string;
    department: Partial<import("mongoose").Document & {
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
    }>;
    session: {
        _id: string;
        nick: string;
        email: string;
        user: string;
        when: string;
        active: boolean;
        token: string;
        departmentId: string;
    };
    user: {
        _id: string;
        nick: string;
        email: string;
        name: string;
        active: boolean;
        when: string;
        departmentId: string;
        salt: string;
        pass: string;
        admin: boolean;
        mapHidden: boolean;
        mapId: string;
        rtsAuthKey: string;
        outsider: boolean;
        remoteLoggingEnabled: boolean;
        isPro: boolean;
    };
    prepareTestData: (callback: SimpleCallback<import("mongoose").Document & {
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
    }>) => void;
    beforeEach: (callback: SimpleCallback<unknown>) => void;
    afterEach: (callback: SimpleCallback<unknown>) => void;
};
export default data;
//# sourceMappingURL=data.d.ts.map