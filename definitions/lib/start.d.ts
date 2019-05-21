/// <reference types="node" />
import * as http from 'http';
import { MongooseModule } from "tabletcommand-backend-models";
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
}>(config: T, startTime: number, mongoose: MongooseModule, mongooseOnOpen: (cfg: T, startTime: number) => (...a: any[]) => any): () => void;
//# sourceMappingURL=start.d.ts.map