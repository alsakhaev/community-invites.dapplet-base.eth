'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function __param(paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
}

const img = "data:image/png;base64,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";

let Feature = class Feature {
    constructor(identityAdapter, // ITwitterAdapter;
    viewportAdapter) {
        this.identityAdapter = identityAdapter;
        this.viewportAdapter = viewportAdapter;
        const wallet = Core.wallet();
        Core.storage.get('overlayUrl').then(url => this._overlay = Core.overlay({ url, title: 'Identity Management' }));
        const { statusLine } = viewportAdapter.exports;
        const { label, button } = this.identityAdapter.exports;
        this.identityAdapter.attachConfig({
            POST_USERNAME_LABEL: [
                label({
                    initial: "DEFAULT",
                    "DEFAULT": {
                        text: 'Devcon 2020 (+1)',
                        exec: () => console.log('Label clicked'),
                        img: img
                    }
                })
            ]
        });
    }
};
Feature = __decorate([
    Injectable,
    __param(0, Inject("identity-adapter.dapplet-base.eth")),
    __param(1, Inject("common-adapter.dapplet-base.eth"))
], Feature);
var Feature$1 = Feature;

exports.default = Feature$1;
