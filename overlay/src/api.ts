import { Profile } from "./dappletBus";

export type Conference = {
    id: number;
    name: string;
    date_from: Date;
    date_to: Date;
    location: string;
    locationUrl: string;
    website: string;
    description: string;
    short_name: string;
}

export type Post = {
    authorFullname: string;
    authorUsername: string;
    authorImg: string;
    id: string;
    text: string;
}

export async function getConferences(): Promise<Conference[]> {
    return Promise.resolve([{
        id: 6,
        name: 'Devcon 6',
        date_from: new Date('2021-04-21T10:00:00Z'),
        date_to: new Date('2021-04-28T20:00:00Z'),
        location: 'Bogota, Colombia',
        locationUrl: 'https://www.openstreetmap.org/search?whereami=1&query=4.7012%2C-74.1484#map=13/4.7012/-74.1484',
        website: 'https://archive.devcon.org/',
        short_name: 'Devcon6',
        description: ''
    }, {
        id: 5,
        name: 'Devcon 5',
        date_from: new Date('2019-10-08T10:00:00Z'),
        date_to: new Date('2019-10-11T20:00:00Z'),
        location: 'Osaka, Japan',
        locationUrl: 'https://www.openstreetmap.org/search?whereami=1&query=4.7012%2C-74.1484#map=13/4.7012/-74.1484',
        website: 'https://archive.devcon.org/devcon-5/details',
        short_name: 'Devcon5',
        description: ''
    }, {
        id: 4,
        name: 'Devcon 4',
        date_from: new Date('2018-10-30T10:00:00Z'),
        date_to: new Date('2018-11-02T20:00:00Z'),
        location: 'Prague, Czech Republic',
        locationUrl: 'https://www.openstreetmap.org/search?whereami=1&query=4.7012%2C-74.1484#map=13/4.7012/-74.1484',
        website: 'https://archive.devcon.org/devcon-4/details',
        short_name: 'Devcon4',
        description: ''
    }, {
        id: 3,
        name: 'Devcon 3',
        date_from: new Date('2017-11-01T10:00:00Z'),
        date_to: new Date('2017-11-04T20:00:00Z'),
        location: 'Cancun, Mexico',
        locationUrl: 'https://www.openstreetmap.org/search?whereami=1&query=4.7012%2C-74.1484#map=13/4.7012/-74.1484',
        website: 'https://archive.devcon.org/devcon-3/details',
        short_name: 'Devcon3',
        description: ''
    }, {
        id: 2,
        name: 'Devcon 2',
        date_from: new Date('2016-09-19T10:00:00Z'),
        date_to: new Date('2016-09-21T20:00:00Z'),
        location: 'Shanghai, China',
        locationUrl: 'https://www.openstreetmap.org/search?whereami=1&query=4.7012%2C-74.1484#map=13/4.7012/-74.1484',
        website: 'https://archive.devcon.org/devcon-3/details',
        short_name: 'Devcon2',
        description: ''
    }, {
        id: 1,
        name: 'Devcon 1',
        date_from: new Date('2015-11-09T10:00:00Z'),
        date_to: new Date('2015-11-13T20:00:00Z'),
        location: 'London, United Kingdom',
        locationUrl: 'https://www.openstreetmap.org/search?whereami=1&query=4.7012%2C-74.1484#map=13/4.7012/-74.1484',
        website: 'https://archive.devcon.org/devcon-3/details',
        short_name: 'Devcon1',
        description: ''
    }, {
        id: 0,
        name: 'Devcon 0',
        date_from: new Date('2014-11-24T10:00:00Z'),
        date_to: new Date('2014-11-28T20:00:00Z'),
        location: 'Kreuzberg, Berlin',
        locationUrl: 'https://www.openstreetmap.org/search?whereami=1&query=4.7012%2C-74.1484#map=13/4.7012/-74.1484',
        website: 'https://archive.devcon.org/devcon-3/details',
        short_name: 'Devcon0',
        description: ''
    }]);
}

export async function getPosts(): Promise<Post[]> {
    const data = [{ "id": "1299982068106039297", "text": "The 3rd disproof of the \"code is law\" principle.\n\nDoes anyone else need more evidence, that the law is not sufficient?", "authorFullname": "Dmitry Palchun", "authorUsername": "Ethernian", "authorImg": "https://pbs.twimg.com/profile_images/814615689868836864/cyMqCC1B_bigger.jpg" }, { "id": "1299403425659011072", "text": "Someone accidentally locked up some tokens in an Ethereum smart contract. \n\n\n@gakonst\n and I thought we'd found a way to recover them.\n\nWe learned that the mempool is a very creepy place.", "authorFullname": "Dan Robinson", "authorUsername": "danrobinson", "authorImg": "https://pbs.twimg.com/profile_images/1289919387/dan_bigger.jpg" }, { "id": "1294381055508709378", "text": "That is a great move!\nLet us do better devcon!", "authorFullname": "Dmitry Palchun", "authorUsername": "Ethernian", "authorImg": "https://pbs.twimg.com/profile_images/814615689868836864/cyMqCC1B_bigger.jpg" }, { "id": "1292238588206292994", "text": "Interessante Systematik!\n\nIch sehe nur \"dead\" Player in der deutschen Politik. EU ist nix besser. Einige sind sogar \"undead\" mit scheinbaren Anzeichen vom \"Leben\".\n\nNun stellen sie sich \"tot\" oder sind sie es wirklich?\n https://medium.com/@samo.burja/live-versus-dead-players-2b24f6e9eae2…\n\nDanke \n@VitalikButerin\n für die Link.", "authorFullname": "Dmitry Palchun", "authorUsername": "Ethernian", "authorImg": "https://pbs.twimg.com/profile_images/814615689868836864/cyMqCC1B_bigger.jpg" }, { "id": "1286771340402405377", "text": "In 1792 #gold was $19.39 per ounce. By the time the Federal Reserve Act was passed 121 years later in 1913 the price of gold had risen to $20.67. Today the price closed above $1,900. It took the Fed 107 years to destroy 99% of the dollar’s value. The last 1% will be the killer!", "authorFullname": "Peter Schiff", "authorUsername": "PeterSchiff", "authorImg": "https://pbs.twimg.com/profile_images/1265705916298641408/qK7MHnk9_bigger.jpg" }, { "id": "1273686602468950022", "text": "Your reminder that $6 trillion was printed with a click of a button and handed to Wall Street and mega-corporations.\n\nJust for some perspective: A million seconds ago was 11 days, a billion seconds ago was 31 years, and a trillion seconds ago there was no written human history.", "authorFullname": "Bitcoin", "authorUsername": "Bitcoin", "authorImg": "https://pbs.twimg.com/profile_images/421692600446619648/dWAbC2wg_bigger.jpeg" }, { "id": "1273221477349933056", "text": "Ein Beweis dafür, \ndass die EU einen Staatskapitalismus anstrebt.\nMit einer engen Sonderbezieung zwischen dem Staat und Konzernen. \n\nGefährlich.", "authorFullname": "Dmitry Palchun", "authorUsername": "Ethernian", "authorImg": "https://pbs.twimg.com/profile_images/814615689868836864/cyMqCC1B_bigger.jpg" }, { "id": "1272155947734052865", "text": "Yepp... Obama's comment is really great.\n\nThe world is messy and full of ambiguities. \"Bads\" and \"Goods\" are oft embodied in the same person. \n\nIf you prefer to point out some's \"bad\" sites instead of leveraging its \"goods\", it is not activism. It's a narcissism.\n\nTnx \n@novogratz", "authorFullname": "Dmitry Palchun", "authorUsername": "Ethernian", "authorImg": "https://pbs.twimg.com/profile_images/814615689868836864/cyMqCC1B_bigger.jpg" }, { "id": "1270326437799739394", "text": "I like the name: \n@ChurchOfConsens\n \n\n\n\"Be different! Stay in Consesus!\"", "authorFullname": "Dmitry Palchun", "authorUsername": "Ethernian", "authorImg": "https://pbs.twimg.com/profile_images/814615689868836864/cyMqCC1B_bigger.jpg" }, { "id": "1269013209106833408", "text": "Ich weiß, wir leben in Kaputalismus.... Es ist eigentlich gaanz logisch... Aber...\n\nHab nur ich ein komisches Gefühl, von einer Bank regiert zu werden?\n", "authorFullname": "Dmitry Palchun", "authorUsername": "Ethernian", "authorImg": "https://pbs.twimg.com/profile_images/814615689868836864/cyMqCC1B_bigger.jpg" }, { "id": "1258008200126664705", "text": "Today there is crypto-twitter debate on personal tokens. It seems important to me, and I think it’s a battle for the meaning of the term. In this thread I’m going to highlight some distinctions to help.", "authorFullname": "Dan Finlay", "authorUsername": "danfinlay", "authorImg": "https://pbs.twimg.com/profile_images/1193987782609256449/9lam7qD4_bigger.jpg" }, { "id": "1268881034537578497", "text": "Interesting article about possibility of parallel national currencies in EU.\n\nNevertheless: crypto as a parallel currency was not covered. Why?", "authorFullname": "Dmitry Palchun", "authorUsername": "Ethernian", "authorImg": "https://pbs.twimg.com/profile_images/814615689868836864/cyMqCC1B_bigger.jpg" }, { "id": "1268864561064574984", "text": "Aaaa!\nThat is great!", "authorFullname": "Dmitry Palchun", "authorUsername": "Ethernian", "authorImg": "https://pbs.twimg.com/profile_images/814615689868836864/cyMqCC1B_bigger.jpg" }, { "id": "1268669553833324545", "text": "It took me one day to make a simple decision:\n\nBLM is a middleman (like any org). It makes sense to avoid any middlemen if possible (disintermediation) and help people directly.\n\nSo I've spent directly to this old lady to rebuild her store: \nhttps://gofundme.com/f/bronx-businesses-help?utm_source=customer&utm_medium=copy_link&utm_campaign=m_pd+share-sheet…\n\n(1/2)", "authorFullname": "Dmitry Palchun", "authorUsername": "Ethernian", "authorImg": "https://pbs.twimg.com/profile_images/814615689868836864/cyMqCC1B_bigger.jpg" }, { "id": "1268669556962328589", "text": "(2/2) To scale it we need confidence that donations reach people who need it. We need oracles for real damages and recipients.\n\netherisk.eth, \n@nexusmutual\n, \n@Vouchforme_co\n? Could you help to verify cases? It's part of your insurance business anyway, isnt it?\n\n@Kleros_io\n, \n@Givethio\n?", "authorFullname": "Dmitry Palchun", "authorUsername": "Ethernian", "authorImg": "https://pbs.twimg.com/profile_images/814615689868836864/cyMqCC1B_bigger.jpg" }, { "id": "1268702580709916674", "text": "UPDATE: \nIt turned out, the lady from the video is not the shop owner but former employee? Still uncertain. \n\nAnyway the upper tweet holds: we need some oracle on-site to deliver help to the right person. It looks like a insurance workflow.", "authorFullname": "Dmitry Palchun", "authorUsername": "Ethernian", "authorImg": "https://pbs.twimg.com/profile_images/814615689868836864/cyMqCC1B_bigger.jpg" }, { "id": "1268512473738600448", "text": "Quote:\n===\n(2) The horizon for net purchases under the PEPP will be extended to at least the end of June 2021. \n===\n\nWhat if  COVID is seasonal like a flu?\n\nLooks like ECB drives the money system against the wall... ", "authorFullname": "Dmitry Palchun", "authorUsername": "Ethernian", "authorImg": "https://pbs.twimg.com/profile_images/814615689868836864/cyMqCC1B_bigger.jpg" }, { "id": "1268005770815291396", "text": "This is how the real democracy SHOULD work.\n\nAt some point you understand, that you need someone with diametrically opposed view.\n\nAs a partner.", "authorFullname": "Dmitry Palchun", "authorUsername": "Ethernian", "authorImg": "https://pbs.twimg.com/profile_images/814615689868836864/cyMqCC1B_bigger.jpg" }, { "id": "1267755453120995328", "text": "1 Hamburger + 1 small cafe.\n+30% zum vorgestern.\n\nSprechen wir noch von einer #deflation?", "authorFullname": "Dmitry Palchun", "authorUsername": "Ethernian", "authorImg": "https://pbs.twimg.com/profile_images/814615689868836864/cyMqCC1B_bigger.jpg" }, { "id": "1267223921163632640", "text": "We are in 21 century but still using the social tech of 19th one, don't you think?\n \nWhy peaceful protestors need to go to the street to be heard? We have chains managing billions, why we are unable to manage simple social decisions? Not perfect, but just  better than now. \n1/2", "authorFullname": "Dmitry Palchun", "authorUsername": "Ethernian", "authorImg": "https://pbs.twimg.com/profile_images/814615689868836864/cyMqCC1B_bigger.jpg" }, { "id": "1267223922778521604", "text": "The chain tech maybe is not suitable to replace paper ballots yet, but it definitely suitable for ad-hoc emergency social decisions and public community statements. It makes more sense than shooting anyway.\n\nAnd if it fails, people can still go to the street and protest.\n2/2", "authorFullname": "Dmitry Palchun", "authorUsername": "Ethernian", "authorImg": "https://pbs.twimg.com/profile_images/814615689868836864/cyMqCC1B_bigger.jpg" }, { "id": "1258008200126664705", "text": "Today there is crypto-twitter debate on personal tokens. It seems important to me, and I think it’s a battle for the meaning of the term. In this thread I’m going to highlight some distinctions to help.", "authorFullname": "Dan Finlay", "authorUsername": "danfinlay", "authorImg": "https://pbs.twimg.com/profile_images/1193987782609256449/9lam7qD4_bigger.jpg" }, { "id": "1268881034537578497", "text": "Interesting article about possibility of parallel national currencies in EU.\n\nNevertheless: crypto as a parallel currency was not covered. Why?", "authorFullname": "Dmitry Palchun", "authorUsername": "Ethernian", "authorImg": "https://pbs.twimg.com/profile_images/814615689868836864/cyMqCC1B_bigger.jpg" }, { "id": "1268864561064574984", "text": "Aaaa!\nThat is great!", "authorFullname": "Dmitry Palchun", "authorUsername": "Ethernian", "authorImg": "https://pbs.twimg.com/profile_images/814615689868836864/cyMqCC1B_bigger.jpg" }, { "id": "1268669553833324545", "text": "It took me one day to make a simple decision:\n\nBLM is a middleman (like any org). It makes sense to avoid any middlemen if possible (disintermediation) and help people directly.\n\nSo I've spent directly to this old lady to rebuild her store: \nhttps://gofundme.com/f/bronx-businesses-help?utm_source=customer&utm_medium=copy_link&utm_campaign=m_pd+share-sheet…\n\n(1/2)", "authorFullname": "Dmitry Palchun", "authorUsername": "Ethernian", "authorImg": "https://pbs.twimg.com/profile_images/814615689868836864/cyMqCC1B_bigger.jpg" }, { "id": "1268669556962328589", "text": "(2/2) To scale it we need confidence that donations reach people who need it. We need oracles for real damages and recipients.\n\netherisk.eth, \n@nexusmutual\n, \n@Vouchforme_co\n? Could you help to verify cases? It's part of your insurance business anyway, isnt it?\n\n@Kleros_io\n, \n@Givethio\n?", "authorFullname": "Dmitry Palchun", "authorUsername": "Ethernian", "authorImg": "https://pbs.twimg.com/profile_images/814615689868836864/cyMqCC1B_bigger.jpg" }, { "id": "1268702580709916674", "text": "UPDATE: \nIt turned out, the lady from the video is not the shop owner but former employee? Still uncertain. \n\nAnyway the upper tweet holds: we need some oracle on-site to deliver help to the right person. It looks like a insurance workflow.", "authorFullname": "Dmitry Palchun", "authorUsername": "Ethernian", "authorImg": "https://pbs.twimg.com/profile_images/814615689868836864/cyMqCC1B_bigger.jpg" }, { "id": "1268512473738600448", "text": "Quote:\n===\n(2) The horizon for net purchases under the PEPP will be extended to at least the end of June 2021. \n===\n\nWhat if  COVID is seasonal like a flu?\n\nLooks like ECB drives the money system against the wall... ", "authorFullname": "Dmitry Palchun", "authorUsername": "Ethernian", "authorImg": "https://pbs.twimg.com/profile_images/814615689868836864/cyMqCC1B_bigger.jpg" }, { "id": "1268005770815291396", "text": "This is how the real democracy SHOULD work.\n\nAt some point you understand, that you need someone with diametrically opposed view.\n\nAs a partner.", "authorFullname": "Dmitry Palchun", "authorUsername": "Ethernian", "authorImg": "https://pbs.twimg.com/profile_images/814615689868836864/cyMqCC1B_bigger.jpg" }, { "id": "1267755453120995328", "text": "1 Hamburger + 1 small cafe.\n+30% zum vorgestern.\n\nSprechen wir noch von einer #deflation?", "authorFullname": "Dmitry Palchun", "authorUsername": "Ethernian", "authorImg": "https://pbs.twimg.com/profile_images/814615689868836864/cyMqCC1B_bigger.jpg" }, { "id": "1267223921163632640", "text": "We are in 21 century but still using the social tech of 19th one, don't you think?\n \nWhy peaceful protestors need to go to the street to be heard? We have chains managing billions, why we are unable to manage simple social decisions? Not perfect, but just  better than now. \n1/2", "authorFullname": "Dmitry Palchun", "authorUsername": "Ethernian", "authorImg": "https://pbs.twimg.com/profile_images/814615689868836864/cyMqCC1B_bigger.jpg" }, { "id": "1267223922778521604", "text": "The chain tech maybe is not suitable to replace paper ballots yet, but it definitely suitable for ad-hoc emergency social decisions and public community statements. It makes more sense than shooting anyway.\n\nAnd if it fails, people can still go to the street and protest.\n2/2", "authorFullname": "Dmitry Palchun", "authorUsername": "Ethernian", "authorImg": "https://pbs.twimg.com/profile_images/814615689868836864/cyMqCC1B_bigger.jpg" }];
    return Promise.resolve(data);
}

export type ConferenceWithInvitations = { conference: Conference, invitations: { from: Profile, to: Profile, post_id: string }[], attendance_from: boolean, attendance_to: boolean };

export class Api {
    constructor(private _url: string) { }

    async getConferencesWithInvitations(from: Profile, to: Profile): Promise<ConferenceWithInvitations[]> {

        const data = await this._sendRequest(`/conferences/invitations?namespace_from=${from.namespace}&username_from=${from.username}&namespace_to=${to.namespace}&username_to=${to.username}`);

        data.forEach((d: any) => d.conference.date_from = new Date(d.conference.date_from));
        data.forEach((d: any) => d.conference.date_to = new Date(d.conference.date_to));

        return data;
    }

    async getConference(id: number): Promise<Conference> {

        const conf = await this._sendRequest(`/conferences/${id}`);

        conf.date_from = new Date(conf.date_from);
        conf.date_to = new Date(conf.date_to);

        return conf;
    }

    async invite(userFrom: Profile, userTo: Profile, conferenceId: number, post: Post) {
        const postDto = {
            id: post.id,
            namespace: 'twitter.com',
            username: post.authorUsername,
            text: post.text
        }
        return await this._sendRequest('/conferences/invite', 'POST', { userFrom, userTo, conferenceId, post: postDto });
    }

    async withdraw(userFrom: Profile, userTo: Profile, conferenceId: number, post: Post) {
        await this._sendRequest('/conferences/withdraw', 'POST', { userFrom, userTo, conferenceId, post });
    }

    async attend(user: Profile, conferenceId: number) {
        return await this._sendRequest('/conferences/attend', 'POST', { user, conferenceId });
    }

    async absend(user: Profile, conferenceId: number) {
        await this._sendRequest('/conferences/absend', 'POST', { user, conferenceId });
    }

    async getUser(namespace: string, username: string): Promise<Profile> {
        return await this._sendRequest(`/users/${namespace}/${username}`);
    }

    async updateUser(user: Profile): Promise<Profile> {
        return await this._sendRequest(`/users`, 'PUT', user);
    }

    async createUser(user: Profile): Promise<Profile> {
        return await this._sendRequest(`/users`, 'POST', user);
    }

    async getPosts(namespace: string, username: string): Promise<Post[]> {
        const data = await this._sendRequest(`/posts?namespace=${namespace}&username=${username}`);

        return data.map((x: any) => ({
            id: x.id,
            text: x.text,
            authorNamespace: x.namespace,
            authorUsername: x.username,
            authorFullname: x.fullname,
            authorImg: x.img
         }));
    }

    private async _sendRequest(query: string, method: 'POST' | 'GET' | 'PUT' = 'GET', body?: any): Promise<any> {
        const init = body ? { body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' }, method } : { method };
        const resp = await fetch(this._url + query, init);
        const json = await resp.json();
        if (!json.success) throw Error(json.message);
        return json.data;
    }
}