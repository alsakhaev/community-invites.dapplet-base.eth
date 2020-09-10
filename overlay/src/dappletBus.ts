import { Bus } from "./bus";

export type Post = {
    authorFullname: string;
    authorUsername: string;
    authorImg: string;
    id: string;
    text: string;
}

export type Settings = {
    contractAddress: string;
    oracleAddress: string;
}

export type UnsignedProve = string;
export type SignedProve = string;

class DappletBus extends Bus {
    _subId: number = 0;

    onProfileSelect(callback: (profile: Post & Settings) => void) {
        this.subscribe('profile_select', (profile: Post & Settings) => {
            callback(profile);
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