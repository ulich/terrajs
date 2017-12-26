const {TerraJS} = require('./terrajs')

let terra

describe("terrajs", () => {

    beforeEach(() => {
        terra = new TerraJS()
    })

    describe("variable", () => {
        it("is generated", () => {
            terra.variable('var1', {
                default: 'foo'
            })
            terra.variable('var2', {
                default: 'bar'
            })

            expect(terra.generate()).toEqual({
                variable: {
                    var1: {
                        default: 'foo'
                    },
                    var2: {
                        default: 'bar'
                    }
                },
                provider: [],
                resource: {}
            })
        })

        it("can be referenced in a resource", () => {
            const variable = terra.variable('foo')

            terra.resource('aws_vpc', 'vpc', {
                cidr_block: variable.ref()
            })

            expect(terra.generate()).toEqual({
                variable: {
                    foo: {}
                },
                provider: [],
                resource: {
                    aws_vpc: {
                        vpc: {
                            cidr_block: "${var.foo}"
                        }
                    }
                }
            })
        })
       
        it("doesn't allow duplicates", () => {
            terra.variable('foo')

            expect(() => {
                terra.variable('foo')
            }).toThrowError('The variable foo was already defined')
        })
    })

    describe("provider", () => {
        it("is generated", () => {
            terra.provider('aws', {
                region: 'eu-east-1'
            })

            expect(terra.generate()).toEqual({
                variable: {},
                provider: [{
                    aws: {
                        region: 'eu-east-1'
                    }
                }],
                resource: {}
            })
        })
    })

    describe("resource", () => {
        it("supports an object as properties", () => {
            terra.resource('aws_vpc', 'example', {
                cidr_block: "172.20.0.0/20"
            })
            
            expect(terra.generate()).toEqual({
                variable: {},
                provider: [],
                resource: {
                    aws_vpc: {
                        example: {
                            cidr_block: "172.20.0.0/20"
                        }
                    }
                }
            })
        })

        it("supports a function as properties to be able to reference the resource's name easily", () => {
            terra.resource('aws_s3_bucket', 'example', ({name}) => ({
                bucket: name
            }))
            
            expect(terra.generate()).toEqual({
                variable: {},
                provider: [],
                resource: {
                    aws_s3_bucket: {
                        example: {
                            bucket: "example"
                        }
                    }
                }
            })
        })

        it("references another resource", () => {
            const vpc = terra.resource('aws_vpc', 'vpc', {})

            terra.resource('aws_subnet', 'subnet', {
                vpc_id: vpc.ref('id')
            })

            expect(terra.generate()).toEqual({
                variable: {},
                provider: [],
                resource: {
                    aws_vpc: {
                        vpc: {}
                    },
                    aws_subnet: {
                        subnet: {
                            vpc_id: "${aws_vpc.vpc.id}"
                        }
                    }
                }
            })
        })

        it("can access the name of another resource", () => {
            const vpc = terra.resource('aws_vpc', 'production', {})
            
            terra.resource('aws_subnet', `${vpc.name}_subnet`, {
                vpc_id: vpc.ref('id')
            })

            expect(terra.generate()).toEqual({
                variable: {},
                provider: [],
                resource: {
                    aws_vpc: {
                        production: {}
                    },
                    aws_subnet: {
                        production_subnet: {
                            vpc_id: "${aws_vpc.production.id}"
                        }
                    }
                }
            })
        })

        it("doesnt allow duplicates", () => {
            terra.resource('aws_vpc', 'example', {})

            expect(() => {
                terra.resource('aws_vpc', 'example', {})
            }).toThrowError('The resource aws_vpc.example was already defined')
        })
    })
})
