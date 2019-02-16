import { store } from '../app.js';

class StoreView {
    constructor() { this.items = []; }
    stores() { return { "persistence": "items" } };
    async getall() {
        return store.get("persistence-services", null, { force: true })
            .then(json => this.services = json)
            .then(() => store.get("persistence"))
            .then(items => this.items = items);
    }
    dispose() {
    }
    getService(serviceid) {
        for (const service of this.services) {
            if (service.id == serviceid)
                return service;
        }
    }
}


const ServicesMixin = {
    methods: {
        persistenceService: function () {
            const service = this.$root.store.getService(this.item.serviceid);
            if (service) return service.label;
            return this.item.serviceid;
        },
        save: function () {
            this.message = null;
            this.messagetitle = "Saving...";
            this.inProgress = true;
            this.changed = false;
            setTimeout(() => this.inProgress = false, 1000);
        },
        remove: function () {
            this.message = null;
            this.messagetitle = "Removing...";
            this.inProgress = true;
        },
    }
}

const ItemListMixin = {
    methods: {
        saveAll: function (items) {
            //TODO
            console.log("save all", items);
        }
    }
};

const mixins = [ServicesMixin];
const listmixins = [ItemListMixin];
const runtimekeys = [];
const schema = null;
const ID_KEY = "uid";

export { mixins, listmixins, schema, runtimekeys, StoreView, ID_KEY };