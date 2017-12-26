# TerraJS

Generate terraform json templates by writing javascript code.


## Why?

Terraform is a very nice tool, but the terraform configuration syntax is very limiting.


## How does it work?

Terraform supports JSON as an alternative template syntax, and TerraJS produces compatible JSON.

TerraJS is a very small library (it actually just consists of one file) and it only relies on
the JSON structure of terraform.


## Example

Install the node.js dependency

```
npm install terrajs
```

Create a main.js file:
```javascript
const {tf} = require('terrajs')

tf.provider('aws', {
    region: 'us-east-1'
})

const vpc = tf.resource('aws_vpc', 'production', {
    cidr_block: '172.230.0.0/16'
})

const subnet = tf.resource('aws_subnet', `${vpc.name}_apps`, {
    vpc_id: vpc.ref('id'),
    cidr_block: '172.230.0.0/24'
})

for (let i = 1; i <= 2; i++) {
    tf.resource('aws_instance', `${vpc.name}_app_${i}`, {
        ami: 'ami-aa2ea6d0',
        instance_type: 't2.micro',
        subnet_id: subnet.ref('id'),
    })    
}

console.log(tf.generateJson())
```

Run it: 

```
node main.js > main.tf.json
```

This produces the following `main.tf.json` file:
```json
{
    "provider": {
        "aws": {
            "region": "us-east-1"
        }
    },
    "resource": {
        "aws_vpc": {
            "production": {
                "cidr_block": "172.230.0.0/16"
            }
        },
        "aws_subnet": {
            "production_apps": {
                "vpc_id": "${aws_vpc.production.id}"
            }
        },
        "aws_instance": {
            "app_1": {
                "ami": "ami-df8406b0",
                "instance_type": "t2.micro",
                "subnet_id": "${aws_subnet.production_apps.id}"
            },
            "app_2": {
                "ami": "ami-df8406b0",
                "instance_type": "t2.micro",
                "subnet_id": "${aws_subnet.production_apps.id}"
            }
        }
    }
}
```

Now simply apply it with terraform:
```
terraform init
terraform apply
```