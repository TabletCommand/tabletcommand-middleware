/// <reference types="node" />
/// <reference types="mongoose" />
import * as http from 'http';
import { MongooseModule } from "tabletcommand-backend-models";
import { AnyCallBack } from '../types/types';
export declare function mongooseOnError(err: Error): void;
export declare function mongooseOnDisconnected(): void;
export declare function serverOnError(error: {
    syscall: string;
    code: string;
}): void;
export declare function serverOnListening(startTime: number, server: http.Server): () => void;
export declare function redisOnError(err: Error): void;
export declare function redisOnConnect<T extends {
    mongoUrl: string;
}, R extends AnyCallBack>(config: T, startTime: number, mongoose: MongooseModule, mongooseOnOpen: (cfg: T, startTime: number) => R): () => Promise<typeof import("mongoose")>;
//# sourceMappingURL=start.d.ts.map