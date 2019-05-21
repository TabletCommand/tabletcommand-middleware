import redis, { RedisClient } from "redis";
import { Department, Location, FieldsOfDocument } from "tabletcommand-backend-models";
export declare function client(config: {
    redis: string;
}): redis.RedisClient;
export declare function listLocation(client: RedisClient, department: Department): Promise<Array<Partial<FieldsOfDocument<Location>>>>;
export declare function storeLocation(client: RedisClient, item: Location): Promise<"OK" | null>;
export declare function storeDebugInfo(client: RedisClient, item: Location): Promise<"OK">;
export declare function checkOnline(client: RedisClient, department: Department): Promise<object[]>;
export declare function expireItemsMatchingKey(client: RedisClient, keyPattern: string, seconds: number): Promise<string[]>;
export declare function storeAPNInfo(client: RedisClient, item: APNItem): Promise<number | null>;
interface APNItem {
    time: number;
    departmentId: string;
}
export declare function getAPNInfo(client: RedisClient, department: Department): Promise<Array<{
    time: number;
    value: number;
}>>;
export {};
//# sourceMappingURL=redis.d.ts.map