const logger = require('../utils/Logger');

class ComponentRegistry {
    constructor() {
        this.components = new Map();
        this.types = ['BUTTON', 'SELECT_MENU', 'MODAL', 'ACTION_ROW'];
    }

    register(component) {
        if (!component.customId || !component.type) {
            throw new Error('Component must have customId and type properties');
        }

        if (!this.types.includes(component.type)) {
            throw new Error(`Invalid component type: ${component.type}`);
        }

        if (!this.components.has(component.type)) {
            this.components.set(component.type, new Map());
        }

        this.components.get(component.type).set(component.customId, component);
        logger.debug(`Registered ${component.type} component: ${component.customId}`);
    }

    get(type, customId) {
        return this.components.get(type)?.get(customId);
    }

    create(type, customId, options = {}) {
        const component = this.get(type, customId);
        if (!component) {
            throw new Error(`Component ${customId} of type ${type} not found`);
        }

        return component.create(options);
    }

    getAllOfType(type) {
        return Array.from(this.components.get(type)?.values() || []);
    }

    getAll() {
        const all = new Map();
        this.types.forEach(type => {
            all.set(type, this.getAllOfType(type));
        });
        return all;
    }
}

module.exports = ComponentRegistry;