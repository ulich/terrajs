const {tf} = require('../terrajs')
const {vpc, subnet} = require('./networking')

tf.provider('aws', {
    region: 'us-east-1'
})

for (let i = 1; i <= 2; i++) {
    tf.resource('aws_instance', `${vpc.name}_app_${i}`, {
        ami: 'ami-aa2ea6d0',
        instance_type: 't2.micro',
        subnet_id: subnet.ref('id'),
    })    
}

console.log(tf.generateJson())
