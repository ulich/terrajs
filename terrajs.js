class TerraJS {

    constructor() {
        this.providers = []
        this.resources = {}
    }

    provider(type, properties) {
        this.providers.push({ [type]: properties })
    }

    resource(type, name, properties) {
        if (!this.resources[type]) {
            this.resources[type] = {}
        }
        
        if (this.resources[type][name]) {
            throw new Error(`The resource ${type}.${name} was already defined`)
        }

        const props = (typeof properties === "function") ? properties({ type, name }) : properties
        this.resources[type][name] = props
        return new Resource(type, name, props)
    }

    generate() {
        return {
            provider: this.providers,
            resource: this.resources
        }
    }

    generateJson() {
        return JSON.stringify(this.generate(), null, 4)
    }
}

class Resource {

    constructor(type, name) {
        this.type = type
        this.name = name
    }

    ref(propertyName) {
        return `\${${this.type}.${this.name}.${propertyName}}`
    }
}


module.exports = {
    TerraJS,
    tf: new TerraJS
}