export type Conference = {
    id: string;
    name: string;
    startDate: Date;
    finishDate: Date;
    location: string;
    locationUrl: string;
    website: string;
}

export async function getConferences(): Promise<Conference[]> {
    return Promise.resolve([{
        id: '6',
        name: 'Devcon 6',
        startDate: new Date('2021-04-21T10:00:00Z'),
        finishDate: new Date('2021-04-28T20:00:00Z'),
        location: 'Bogota, Colombia',
        locationUrl: 'https://www.openstreetmap.org/search?whereami=1&query=4.7012%2C-74.1484#map=13/4.7012/-74.1484',
        website: 'https://archive.devcon.org/'
    }, {
        id: '5',
        name: 'Devcon 5',
        startDate: new Date('2019-10-08T10:00:00Z'),
        finishDate: new Date('2019-10-11T20:00:00Z'),
        location: 'Osaka, Japan',
        locationUrl: 'https://www.openstreetmap.org/search?whereami=1&query=4.7012%2C-74.1484#map=13/4.7012/-74.1484',
        website: 'https://archive.devcon.org/devcon-5/details'
    }, {
        id: '4',
        name: 'Devcon 4',
        startDate: new Date('2018-10-30T10:00:00Z'),
        finishDate: new Date('2018-11-02T20:00:00Z'),
        location: 'Prague, Czech Republic',
        locationUrl: 'https://www.openstreetmap.org/search?whereami=1&query=4.7012%2C-74.1484#map=13/4.7012/-74.1484',
        website: 'https://archive.devcon.org/devcon-4/details'
    }, {
        id: '3',
        name: 'Devcon 3',
        startDate: new Date('2017-11-01T10:00:00Z'),
        finishDate: new Date('2017-11-04T20:00:00Z'),
        location: 'Cancun, Mexico',
        locationUrl: 'https://www.openstreetmap.org/search?whereami=1&query=4.7012%2C-74.1484#map=13/4.7012/-74.1484',
        website: 'https://archive.devcon.org/devcon-3/details'
    }, {
        id: '2',
        name: 'Devcon 2',
        startDate: new Date('2016-09-19T10:00:00Z'),
        finishDate: new Date('2016-09-21T20:00:00Z'),
        location: 'Shanghai, China',
        locationUrl: 'https://www.openstreetmap.org/search?whereami=1&query=4.7012%2C-74.1484#map=13/4.7012/-74.1484',
        website: 'https://archive.devcon.org/devcon-3/details'
    }, {
        id: '1',
        name: 'Devcon 1',
        startDate: new Date('2015-11-09T10:00:00Z'),
        finishDate: new Date('2015-11-13T20:00:00Z'),
        location: 'London, United Kingdom',
        locationUrl: 'https://www.openstreetmap.org/search?whereami=1&query=4.7012%2C-74.1484#map=13/4.7012/-74.1484',
        website: 'https://archive.devcon.org/devcon-3/details'
    }, {
        id: '0',
        name: 'Devcon 0',
        startDate: new Date('2014-11-24T10:00:00Z'),
        finishDate: new Date('2014-11-28T20:00:00Z'),
        location: 'Kreuzberg, Berlin',
        locationUrl: 'https://www.openstreetmap.org/search?whereami=1&query=4.7012%2C-74.1484#map=13/4.7012/-74.1484',
        website: 'https://archive.devcon.org/devcon-3/details'
    }]);
}