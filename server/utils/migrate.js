const fs = require("fs");
const fetch = require("node-fetch");
const path = require("path");
const data = require('../data/accounts/dapplet-base.json');
const ethers = require("ethers");

const DATA_STORAGE_PATH = path.join(__dirname, '../../data/storage');

async function getFile(url) {
    const protocol = url.substring(0, url.indexOf(":"));

    switch (protocol) {
        case "http":
        case "https":
            return await (await fetch(url)).arrayBuffer();
        case "bzz":
            // ToDo: parametrize gateway url
            return await (await fetch("https://swarm-gateways.net/" + url)).arrayBuffer();
        default:
            return await new Promise((resolve, reject) =>
                fs.readFile(DATA_STORAGE_PATH + '/' + url, (err, buf) => err ? reject(err.message) : resolve(buf))
            );
    }
}

async function start() {
    for (const name in data.modules) {
        for (const branch in data.modules[name]) {
            for (const version in data.modules[name][branch]) {
                const uris = data.modules[name][branch][version];
                const files = await Promise.all(uris.map(u => getFile(u)));

                const manifestStrings = files.map(f => new TextDecoder('utf-8').decode(f));
                const manifests = manifestStrings.map(s => JSON.parse(s));

                console.log(manifests);

                const distFiles = await Promise.all(manifests.map(m => getFile(m.dist)));


                const hashes = distFiles.map(f => ethers.utils.keccak256(new Uint8Array(f)).substring(2));
                console.log(hashes);
            }
        }
    }
}

start();