class TerraJS {

    constructor() {
        this.providers = []
        this.resources = {}
        this.variables = {}
    }

    variable(name, properties = {}) {
        if (this.variables[name]) {
            throw new Error(`The variable ${name} was already defined`)
        }

        this.variables[name] = properties
        return new Variable(name, properties)
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
            variable: this.variables,
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

class Variable {

    constructor(name) {
        this.name = name
    }

    ref() {
        return `\${var.${this.name}}`
    }
}


module.exports = {
    TerraJS,
    tf: new TerraJS
}