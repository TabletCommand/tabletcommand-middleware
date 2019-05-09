declare module "express-statsd" {
    
    function statsd() : (req: import('express').Request, res: import('express').Response) => void;
    export default statsd;
}