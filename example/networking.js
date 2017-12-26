const {tf} = require('../terrajs')

const vpc = tf.resource('aws_vpc', 'production', {
    cidr_block: '172.230.0.0/16'
})

const subnet = tf.resource('aws_subnet', `${vpc.name}_apps`, {
    vpc_id: vpc.ref('id'),
    cidr_block: '172.230.0.0/24'
})

module.exports = {
    vpc, subnet
}