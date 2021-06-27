const Account = require('./Account');
const Character = require('./Character');
const WS = require('./WS');
const fs = require('fs');

class Manager {
    constructor() {
        this.loadAccounts();
    }

    async loadAccounts() {
        // Load from json
    }

    async accUpdate(accData) {
        
    }

    async saveAndExit(data) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                console.log(data.me.charname);

                resolve();
            }, 0);
        });
    }

    updates = [];
}

module.exports.Manager = new Manager();