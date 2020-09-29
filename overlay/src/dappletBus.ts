import { Bus } from "./bus";

export type Post = {
    authorFullname: string;
    authorUsername: string;
    authorImg: string;
    id: string;
    text: string;
};

export type Profile = {
    namespace: string;
    username: string;
    fullname: string;
    img: string;
    main_conference_id: number | null;    
};

export type Settings = {
    serverUrl: string;
};

export type Data = {
    post?: Post;
    profile?: Profile;
    settings: Settings;
}

export type UnsignedProve = string;
export type SignedProve = string;

class DappletBus extends Bus {
    _subId: number = 0;

    onData(callback: (data: Data) => void) {
        this.subscribe('data', (data: Data) => {
            callback(data);
            return (++this._subId).toString();
        });
    }

    public async call(method: string, args: any, callbackEvent: string): Promise<any> {
        return new Promise((res, rej) => {
            this.publish(this._subId.toString(), {
                type: method,
                message: args
            });
            this.subscribe(callbackEvent, (result: any) => {
                this.unsubscribe(callbackEvent);
                res(result);
                // ToDo: add reject call
            });
        });
    }
}

const dappletInstance = new DappletBus();

export {
    dappletInstance,
    DappletBus
};