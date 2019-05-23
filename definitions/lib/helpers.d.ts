import request from "request";
import { Response, Request } from 'express';
import { User, Session, Department } from "tabletcommand-backend-models";
import express = require("express");
import { UserInfo } from "../middleware/token-session";
export declare function calculateOffsetFromTime(time: number): {
    offset: number;
    server: number;
    received: number;
};
export declare function fixObjectBooleanKey<K extends PropertyKey>(obj: Partial<Record<K, number | string | boolean>>, key: K, defaultValue: boolean): void;
export declare function sortWebListsForCollection<T extends {
    isMandatory?: boolean;
    active?: boolean;
    position?: number;
    friendly_id?: string;
}>(list: T[], collectionName: string): T[];
export declare function joinParentChildCollections<TChild extends Record<TParentLocalId | TParentApiId | TParentName | TParentUuid, string>, TParent extends {
    "local_id": TChild[TParentLocalId];
    "uuid": TChild[TParentUuid];
    "name": TChild[TParentName];
    "id": TChild[TParentApiId];
} & Record<TParentDest, TChild[]>, TParentLocalId extends PropertyKey, TParentApiId extends PropertyKey, TParentName extends PropertyKey, TParentUuid extends PropertyKey, TParentDest extends keyof TParent>(parents: TParent[], children: TChild[], parentApiId: TParentApiId, parentLocalId: TParentLocalId, parentName: TParentName, parentUuid: TParentUuid, parentDest: TParentDest): TParent[];
declare type BooleanLike = boolean | string | number;
export declare function itemIsTrue(item: Record<string, string[] | string | null | undefined> | null, key: string): boolean;
export declare function itemIsTrue<K extends PropertyKey>(item: Partial<Record<K, BooleanLike | null>> | null, key: K): boolean;
export declare function isAdmin(item: {
    admin?: BooleanLike;
} | null): boolean;
export declare function isSuper(item: {
    superuser?: BooleanLike;
} | null): boolean;
export declare function isActive(item: {
    active?: BooleanLike;
} | null): boolean;
export declare function verifyJson(req: Request, res: Response, buf: string): void;
export declare function makeId(length: number): string;
export declare function hasFeature(dept: Department, feature: keyof Department): number;
export declare function isItemValidOnMap(item: {
    latitude: string;
    longitude: string;
}): boolean;
export declare function cleanupUser(user: UserInfo): UserInfo;
export declare function resolveUser(args: {
    req$: express.Request;
    user: UserInfo;
}): {
    user: UserInfo;
    session: Session | null;
} | null;
interface ResolveLoginArg {
    req$: {
        seneca: {
            login: UserInfo;
        };
    };
}
export declare function resolveLogin(args: ResolveLoginArg): UserInfo | null;
export declare function extractInfoFromDevice(device: {
    token?: string;
    env: string;
    ver: string;
    ua?: string;
    time: number;
    bundleIdentifier?: string;
    silentEnabled?: boolean;
    richEnabled?: boolean;
}): {
    appVer: string;
    osVer: string;
    env: string;
    daysSinceEvent: number;
};
export declare function headersToDevice(token: string, headers: express.Request['headers']): {
    token: string;
    env: string;
    ver: string;
    ua: string | undefined;
    time: number;
    bundleIdentifier: string;
    silentEnabled: boolean;
    richEnabled: boolean;
};
export declare function logUserDevice(postUrl: string, authToken: string, user: User, session: Session, headers: Request['headers']): request.Request | undefined;
export declare function requestPost(postUrl: string, authToken: string, item: unknown, callback?: request.RequestCallback): request.Request;
export declare function convertToPromise<T = never>(fn: (cb: (err: Error | null, result: T | null | undefined) => void) => void): Promise<T>;
export {};
//# sourceMappingURL=helpers.d.ts.map