const {TerraJS} = require('./terrajs')

let terra

describe("terrajs", () => {

    beforeEach(() => {
        terra = new TerraJS()
    })

    describe("provider", () => {
        it("is generated", () => {
            terra.provider('aws', {
                region: 'eu-east-1'
            })

            expect(terra.generate()).toEqual({
                provider: {
                    aws: {
                        region: 'eu-east-1'
                    }
                },
                resource: {}
            })
        })

        it("doesnt allow duplicates", () => {
            terra.provider('aws', {})

            expect(() => {
                terra.provider('aws', {})
            }).toThrowError('The provider aws was already defined')
        })
    })

    describe("resource", () => {
        it("supports an object as properties", () => {
            terra.resource('aws_vpc', 'example', {
                cidr_block: "172.20.0.0/20"
            })
            
            expect(terra.generate()).toEqual({
                provider: {},
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
                provider: {},
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
                provider: {},
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
                provider: {},
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
